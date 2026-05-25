import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";
import { productSchema } from "@/lib/validations";
import { getSupabaseErrorMessage } from "@/lib/supabase/errors";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await requireAdmin();
  const { id } = await params;

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
  const { error } = await supabase
    .from("products")
    .update(parsed.data)
    .eq("id", id);

  if (error) {
    return NextResponse.json(
      { error: getSupabaseErrorMessage(error.message) },
      { status: 400 },
    );
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await requireAdmin();
  const { id } = await params;
  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) {
    return NextResponse.json(
      { error: getSupabaseErrorMessage(error.message) },
      { status: 400 },
    );
  }

  return NextResponse.json({ ok: true });
}
