import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { OrderItem } from "@/lib/types";
import { requireUser } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate } from "@/lib/utils/format";

export default async function OrdersPage() {
  const user = await requireUser("/orders");
  const supabase = await createClient();
  const { data: orders } = await supabase.from("orders").select("*, order_items(*)").eq("user_id", user.id).order("created_at", { ascending: false });

  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-black">طلباتي</h1>
      {orders?.length ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <article key={order.id} className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-black">طلب #{order.order_number}</h2>
                  <p className="text-sm text-zinc-500">{formatDate(order.created_at)}</p>
                </div>
                <Badge>{order.status}</Badge>
              </div>
              <div className="mt-4 space-y-2 text-sm">
                {order.order_items?.map((item: OrderItem) => <p key={item.id}>{item.product_name} × {item.quantity}</p>)}
              </div>
              <strong className="mt-4 block text-emerald-700">{formatCurrency(order.total)}</strong>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState title="لا توجد طلبات بعد" />
      )}
    </section>
  );
}
