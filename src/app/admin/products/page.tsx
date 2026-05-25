import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { requireAdmin } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils/format";

export default async function AdminProductsPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data: products } = await supabase.from("products").select("*, categories(*)").order("created_at", { ascending: false });

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-black">المنتجات</h1>
        <Button asChild><Link href="/admin/products/new">إضافة منتج</Link></Button>
      </div>
      <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <Table>
          <THead><TR><TH>المنتج</TH><TH>السعر</TH><TH>المخزون</TH><TH>الحالة</TH><TH /></TR></THead>
          <TBody>
            {products?.map((product) => (
              <TR key={product.id}>
                <TD className="font-bold">{product.name}</TD>
                <TD>{formatCurrency(product.sale_price ?? product.price)}</TD>
                <TD>{product.stock}</TD>
                <TD>{product.status}</TD>
                <TD><Button asChild size="sm" variant="outline"><Link href={`/admin/products/${product.id}`}>تعديل</Link></Button></TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </div>
    </section>
  );
}
