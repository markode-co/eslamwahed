import { CheckoutForm } from "./checkout-form";
import { requireUser } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrency } from "@/lib/utils/format";

export default async function CheckoutPage() {
  const user = await requireUser("/checkout");
  const supabase = await createClient();
  const { data: items } = await supabase.from("cart_items").select("*, products(*)").eq("user_id", user.id);
  const subtotal = (items ?? []).reduce((sum, item) => sum + (item.products.sale_price ?? item.products.price) * item.quantity, 0);
  const shipping = subtotal > 2500 ? 0 : 80;

  return (
    <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 lg:grid-cols-[1fr_380px]">
      <div>
        <h1 className="mb-6 text-3xl font-black">إتمام الطلب</h1>
        {items?.length ? <CheckoutForm /> : <EmptyState title="لا توجد منتجات للدفع" />}
      </div>
      <aside className="h-fit rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-xl font-black">الدفع عند الاستلام</h2>
        <div className="mt-5 space-y-3 text-sm">
          <p className="flex justify-between"><span>المنتجات</span><strong>{formatCurrency(subtotal)}</strong></p>
          <p className="flex justify-between"><span>الشحن</span><strong>{formatCurrency(shipping)}</strong></p>
          <p className="flex justify-between border-t border-zinc-200 pt-3 text-base dark:border-zinc-800"><span>الإجمالي المتوقع</span><strong>{formatCurrency(subtotal + shipping)}</strong></p>
        </div>
      </aside>
    </section>
  );
}
