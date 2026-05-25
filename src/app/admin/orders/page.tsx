import { revalidatePath } from "next/cache";
import { Button } from "@/components/ui/button";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate } from "@/lib/utils/format";

async function updateStatus(formData: FormData) {
  "use server";
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("orders").update({ status: formData.get("status") }).eq("id", formData.get("id"));
  revalidatePath("/admin/orders");
}

export default async function AdminOrdersPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data: orders } = await supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false });

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-black">إدارة الطلبات</h1>
      <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <Table>
          <THead><TR><TH>رقم الطلب</TH><TH>العميل</TH><TH>الهاتف</TH><TH>الإجمالي</TH><TH>الحالة</TH><TH>التاريخ</TH><TH /></TR></THead>
          <TBody>
            {orders?.map((order) => (
              <TR key={order.id}>
                <TD className="font-bold">#{order.order_number}</TD>
                <TD>{order.customer_name}</TD>
                <TD>{order.phone}</TD>
                <TD>{formatCurrency(order.total)}</TD>
                <TD><Badge>{order.status}</Badge></TD>
                <TD>{formatDate(order.created_at)}</TD>
                <TD>
                  <form action={updateStatus} className="flex gap-2">
                    <input type="hidden" name="id" value={order.id} />
                    <select name="status" defaultValue={order.status} className="h-9 rounded-md border border-zinc-200 bg-white px-2 dark:border-zinc-800 dark:bg-zinc-950">
                      <option value="pending">pending</option><option value="confirmed">confirmed</option><option value="shipping">shipping</option><option value="delivered">delivered</option><option value="cancelled">cancelled</option>
                    </select>
                    <Button size="sm">حفظ</Button>
                  </form>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </div>
    </section>
  );
}
