import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";
import { productSchema } from "@/lib/validations";
import { getSupabaseErrorMessage } from "@/lib/supabase/errors";

function toSlug(value: string) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return slug || `product-${Date.now().toString(36)}`;
}

async function getUniqueSlug(supabase: Awaited<ReturnType<typeof createClient>>, slug: string) {
  const { data } = await supabase
    .from("products")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (!data) return slug;
  return `${slug}-${Date.now().toString(36)}`;
}

export async function POST(request: Request) {
  await requireAdmin();

  const body = await request.json();
  const supabase = await createClient();
  const englishName = String(body.english_name ?? body.slug ?? body.name ?? "");
  const slug = await getUniqueSlug(supabase, toSlug(englishName));

  const parsed = productSchema.safeParse({
    ...body,
    slug,
    category_id: body.category_id || null,
    sale_price: body.sale_price || null,
  });

  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return NextResponse.json(
      {
        error: issue?.message ?? "بيانات المنتج غير صحيحة",
        field: issue?.path.join("."),
        issues: parsed.error.issues,
      },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("products")
    .insert(parsed.data)
    .select("id, slug")
    .single();

  if (error) {
    return NextResponse.json(
      { error: getSupabaseErrorMessage(error.message) },
      { status: 400 },
    );
  }

  return NextResponse.json({ ok: true, id: data.id, slug: data.slug });
}
