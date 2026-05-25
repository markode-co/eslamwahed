import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const { code, subtotal } = await request.json();
  const supabase = await createClient();
  const { data: coupon } = await supabase.from("coupons").select("*").eq("code", String(code).toUpperCase()).eq("is_active", true).maybeSingle();
  if (!coupon) return NextResponse.json({ error: "كود غير صالح" }, { status: 404 });
  const discount = coupon.type === "percent" ? Math.round((Number(subtotal) * coupon.value) / 100) : coupon.value;
  return NextResponse.json({ discount });
}
