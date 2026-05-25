import { Metadata } from "next";
import { ProductCard } from "@/components/store/product-card";
import { EmptyState } from "@/components/ui/empty-state";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "المنتجات" };

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string; sort?: string }> }) {
  const params = await searchParams;
  if (!hasSupabaseEnv()) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-10">
        <h1 className="mb-6 text-3xl font-black">المنتجات</h1>
        <EmptyState title="Supabase غير متصل" description="أضف مفاتيح Supabase في .env.local لعرض المنتجات الحقيقية." />
      </section>
    );
  }
  const supabase = await createClient();
  let query = supabase.from("products").select("*, categories(*)").eq("status", "active");

  if (params.q) query = query.ilike("name", `%${params.q}%`);
  if (params.category) query = query.eq("categories.slug", params.category);
  if (params.sort === "price_asc") query = query.order("price", { ascending: true });
  else if (params.sort === "price_desc") query = query.order("price", { ascending: false });
  else query = query.order("created_at", { ascending: false });

  const { data: products } = await query;

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-black">المنتجات</h1>
        <p className="mt-2 text-zinc-500">بحث مباشر وفلترة عبر رابط الصفحة وقاعدة البيانات.</p>
      </div>
      {products?.length ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {products.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      ) : (
        <EmptyState title="لا توجد نتائج" description="جرب كلمات بحث مختلفة أو أضف منتجات نشطة من لوحة الإدارة." />
      )}
    </section>
  );
}
