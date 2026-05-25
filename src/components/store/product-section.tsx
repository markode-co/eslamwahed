import { Product } from "@/lib/types";
import { ProductCard } from "./product-card";
import { EmptyState } from "@/components/ui/empty-state";

export function ProductSection({ title, products }: { title: string; products: Product[] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-5 flex items-end justify-between">
        <h2 className="text-2xl font-black">{title}</h2>
      </div>
      {products.length ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {products.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      ) : (
        <EmptyState title="لا توجد منتجات حاليا" description="عند إضافة منتجات من لوحة التحكم ستظهر هنا تلقائيا." />
      )}
    </section>
  );
}
