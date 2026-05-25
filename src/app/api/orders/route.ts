import { NextResponse } from "next/server";
import { checkoutSchema } from "@/lib/validations";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = checkoutSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });

  const { data: cart } = await supabase.from("cart_items").select("*, products(*)").eq("user_id", user.id);
  if (!cart?.length) return NextResponse.json({ error: "السلة فارغة" }, { status: 400 });

  for (const item of cart) {
    if (!item.products || item.products.stock < item.quantity) {
      return NextResponse.json({ error: `الكمية غير متاحة للمنتج ${item.products?.name ?? ""}` }, { status: 400 });
    }
  }

  const subtotal = cart.reduce((sum, item) => sum + (item.products.sale_price ?? item.products.price) * item.quantity, 0);
  const shipping = subtotal > 2500 ? 0 : 80;
  let discount = 0;
  const couponCode = parsed.data.coupon_code?.trim().toUpperCase() || null;

  if (couponCode) {
    const { data: coupon } = await supabase.from("coupons").select("*").eq("code", couponCode).eq("is_active", true).maybeSingle();
    const validDates =
      coupon &&
      (!coupon.starts_at || new Date(coupon.starts_at) <= new Date()) &&
      (!coupon.expires_at || new Date(coupon.expires_at) >= new Date()) &&
      (!coupon.max_uses || coupon.used_count < coupon.max_uses);
    if (!validDates) return NextResponse.json({ error: "كود الخصم غير صالح" }, { status: 400 });
    discount = coupon.type === "percent" ? Math.round((subtotal * coupon.value) / 100) : coupon.value;
    await supabase.from("coupons").update({ used_count: coupon.used_count + 1 }).eq("id", coupon.id);
  }

  const total = Math.max(0, subtotal + shipping - discount);
  const orderNumber = `EW-${Date.now().toString(36).toUpperCase()}`;
  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      order_number: orderNumber,
      status: "pending",
      customer_name: parsed.data.customer_name,
      phone: parsed.data.phone,
      email: parsed.data.email || user.email,
      address: parsed.data.address,
      city: parsed.data.city,
      notes: parsed.data.notes,
      coupon_code: couponCode,
      subtotal,
      shipping,
      discount,
      total,
    })
    .select()
    .single();

  if (error || !order) return NextResponse.json({ error: error?.message ?? "تعذر حفظ الطلب" }, { status: 500 });

  await supabase.from("order_items").insert(
    cart.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: item.products.name,
      price: item.products.sale_price ?? item.products.price,
      quantity: item.quantity,
      selected_color: item.selected_color,
      selected_size: item.selected_size,
    })),
  );

  await Promise.all(
    cart.map((item) =>
      supabase
        .from("products")
        .update({ stock: Math.max(0, item.products.stock - item.quantity), sales_count: item.products.sales_count + item.quantity })
        .eq("id", item.product_id),
    ),
  );

  await supabase.from("cart_items").delete().eq("user_id", user.id);
  await supabase.from("notifications").insert({ user_id: user.id, title: "طلب جديد", body: `تم إنشاء الطلب ${orderNumber}`, type: "order", payload: { order_id: order.id } });

  return NextResponse.json({ ok: true, order_number: orderNumber });
}
