import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function POST(request: Request) {
  const { supabase, user } = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    if (form.get("_method") === "DELETE") {
      const id = new URL(request.url).searchParams.get("id");
      if (id) await supabase.from("cart_items").delete().eq("id", id).eq("user_id", user.id);
      return NextResponse.redirect(new URL("/cart", request.url));
    }
  }

  const body = await request.json();
  const productId = body.product_id as string;
  const quantity = Number(body.quantity ?? 1);

  const { data: product } = await supabase.from("products").select("id, stock, status").eq("id", productId).single();
  if (!product || product.status !== "active" || product.stock < quantity) {
    return NextResponse.json({ error: "Out of stock" }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .eq("selected_color", body.selected_color ?? null)
    .eq("selected_size", body.selected_size ?? null)
    .maybeSingle();

  if (existing) {
    await supabase.from("cart_items").update({ quantity: existing.quantity + quantity }).eq("id", existing.id);
  } else {
    await supabase.from("cart_items").insert({
      user_id: user.id,
      product_id: productId,
      quantity,
      selected_color: body.selected_color ?? null,
      selected_size: body.selected_size ?? null,
    });
  }

  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request) {
  const { supabase, user } = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, quantity } = await request.json();
  await supabase.from("cart_items").update({ quantity: Math.max(1, Number(quantity)) }).eq("id", id).eq("user_id", user.id);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const { supabase, user } = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = new URL(request.url).searchParams.get("id");
  await supabase.from("cart_items").delete().eq("id", id).eq("user_id", user.id);
  return NextResponse.json({ ok: true });
}
