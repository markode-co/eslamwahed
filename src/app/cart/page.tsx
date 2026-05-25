import Link from "next/link";
import Image from "next/image";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/supabase/queries";
import { formatCurrency } from "@/lib/utils/format";
import { CartQuantityForm } from "./quantity-form";

export default async function CartPage() {
  const user = await requireUser("/cart");
  const supabase = await createClient();
  const { data: items } = await supabase.from("cart_items").select("*, products(*)").eq("user_id", user.id).order("created_at", { ascending: false });
  const subtotal = (items ?? []).reduce((sum, item) => sum + (item.products.sale_price ?? item.products.price) * item.quantity, 0);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-black">السلة</h1>
      {items?.length ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="grid gap-4 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 md:grid-cols-[96px_1fr_auto]">
                <div className="relative aspect-square overflow-hidden rounded-md bg-zinc-100">
                  <Image src={item.products.images?.[0] ?? "/product-placeholder.svg"} alt={item.products.name} fill className="object-cover" />
                </div>
                <div>
                  <Link href={`/products/${item.products.slug}`} className="font-bold">{item.products.name}</Link>
                  <p className="mt-2 text-sm text-zinc-500">{formatCurrency(item.products.sale_price ?? item.products.price)}</p>
                  <CartQuantityForm itemId={item.id} quantity={item.quantity} />
                </div>
                <form action={`/api/cart?id=${item.id}`} method="POST">
                  <input type="hidden" name="_method" value="DELETE" />
                  <Button variant="ghost" size="icon" aria-label="حذف"><Trash2 className="h-4 w-4" /></Button>
                </form>
              </div>
            ))}
          </div>
          <aside className="h-fit rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="text-xl font-black">ملخص الطلب</h2>
            <div className="my-5 flex justify-between"><span>الإجمالي</span><strong>{formatCurrency(subtotal)}</strong></div>
            <Button asChild className="w-full"><Link href="/checkout">إتمام الطلب</Link></Button>
          </aside>
        </div>
      ) : (
        <EmptyState title="السلة فارغة" description="أضف منتجات للسلة لتتمكن من إتمام الطلب." />
      )}
    </section>
  );
}
