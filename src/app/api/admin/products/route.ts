import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";
import { productSchema } from "@/lib/validations";
import { getSupabaseErrorMessage } from "@/lib/supabase/errors";

export async function POST(request: Request) {
  await requireAdmin();

  const parsed = productSchema.safeParse(await request.json());
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

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .insert(parsed.data)
    .select("id")
    .single();

  if (error) {
    return NextResponse.json(
      { error: getSupabaseErrorMessage(error.message) },
      { status: 400 },
    );
  }

  return NextResponse.json({ ok: true, id: data.id });
}
