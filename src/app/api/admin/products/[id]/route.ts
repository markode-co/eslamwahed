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
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "بيانات المنتج غير صحيحة" },
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
