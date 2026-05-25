import Link from "next/link";
import { Package, ReceiptText, Users, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SalesChart } from "@/components/admin/admin-charts";
import { requireAdmin } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils/format";

export default async function AdminPage() {
  await requireAdmin();
  const supabase = await createClient();
  const [products, orders, users] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("total, created_at, status"),
    supabase.from("users").select("id", { count: "exact", head: true }),
  ]);
  const revenue = (orders.data ?? []).reduce((sum, order) => sum + Number(order.total), 0);
  const chart = Object.values(
    (orders.data ?? []).reduce<Record<string, { name: string; total: number }>>((acc, order) => {
      const name = new Date(order.created_at).toLocaleDateString("ar-EG", { month: "short", day: "numeric" });
      acc[name] = { name, total: (acc[name]?.total ?? 0) + Number(order.total) };
      return acc;
    }, {}),
  );

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black">لوحة التحكم</h1>
          <p className="mt-2 text-zinc-500">إدارة المنتجات والطلبات والمستخدمين والتصدير.</p>
        </div>
        <Button asChild variant="secondary"><Link href="/">وضع المستخدم</Link></Button>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {[["الأرباح", formatCurrency(revenue), Wallet], ["الطلبات", String(orders.data?.length ?? 0), ReceiptText], ["المنتجات", String(products.count ?? 0), Package], ["المستخدمون", String(users.count ?? 0), Users]].map(([label, value, Icon]) => (
          <Card key={String(label)}>
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Icon className="h-5 w-5 text-emerald-600" /> {label as string}</CardTitle></CardHeader>
            <CardContent><strong className="text-2xl">{value as string}</strong></CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader><CardTitle>المبيعات</CardTitle></CardHeader>
          <CardContent><SalesChart data={chart} /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>إجراءات سريعة</CardTitle></CardHeader>
          <CardContent className="grid gap-3">
            <Button asChild><Link href="/admin/products/new">إضافة منتج</Link></Button>
            <Button asChild variant="outline"><Link href="/admin/orders">إدارة الطلبات</Link></Button>
            <Button asChild variant="outline"><Link href="/admin/users">إدارة المستخدمين</Link></Button>
            <Button asChild variant="secondary"><a href="/api/admin/export?table=orders&format=xlsx">تصدير Excel</a></Button>
            <Button asChild variant="secondary"><a href="/api/admin/export?table=orders&format=csv">تصدير CSV</a></Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
