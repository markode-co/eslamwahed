import Image from "next/image";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShoppingBag, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AddToCartButton } from "@/components/store/add-to-cart-button";
import { ProductSection } from "@/components/store/product-section";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils/format";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  if (!hasSupabaseEnv()) return { title: "منتج" };
  const supabase = await createClient();
  const { data } = await supabase.from("products").select("name, short_description").eq("slug", slug).single();
  return { title: data?.name ?? "منتج", description: data?.short_description ?? undefined };
}

export default async function ProductDetails({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!hasSupabaseEnv()) notFound();
  const supabase = await createClient();
  const { data: product } = await supabase.from("products").select("*, categories(*)").eq("slug", slug).eq("status", "active").single();
  if (!product) notFound();

  const { data: related } = await supabase
    .from("products")
    .select("*, categories(*)")
    .eq("status", "active")
    .neq("id", product.id)
    .eq("category_id", product.category_id)
    .limit(4);

  const images: string[] = product.images?.length ? product.images : ["/product-placeholder.svg"];

  return (
    <>
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-2">
        <div className="grid gap-3">
          <div className="relative aspect-square overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-900">
            <Image src={images[0]} alt={product.name} fill className="object-cover" priority />
          </div>
          <div className="grid grid-cols-4 gap-3">
            {images.slice(1, 5).map((image: string) => (
              <div key={image} className="relative aspect-square overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-900">
                <Image src={image} alt={product.name} fill className="object-cover" />
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <Badge>{product.categories?.name ?? "منتج"}</Badge>
          <div>
            <h1 className="text-4xl font-black">{product.name}</h1>
            <p className="mt-3 text-lg leading-8 text-zinc-600 dark:text-zinc-300">{product.short_description}</p>
          </div>
          <div className="flex items-end gap-3">
            <strong className="text-3xl text-emerald-700 dark:text-emerald-400">{formatCurrency(product.sale_price ?? product.price)}</strong>
            {product.sale_price ? <span className="text-zinc-400 line-through">{formatCurrency(product.price)}</span> : null}
          </div>
          <div className="grid gap-4 rounded-lg border border-zinc-200 p-4 text-sm dark:border-zinc-800">
            <p>المخزون: <strong>{product.stock}</strong></p>
            {product.colors?.length ? <p>الألوان: {product.colors.join("، ")}</p> : null}
            {product.sizes?.length ? <p>المقاسات: {product.sizes.join("، ")}</p> : null}
            <p className="flex items-center gap-2 text-emerald-700"><Truck className="h-4 w-4" /> الدفع عند الاستلام مع حساب الشحن في صفحة الدفع</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <AddToCartButton productId={product.id} disabled={product.stock <= 0} size="lg"><ShoppingBag className="h-5 w-5" /> أضف للسلة</AddToCartButton>
            <AddToCartButton productId={product.id} disabled={product.stock <= 0} size="lg" variant="secondary">شراء الآن</AddToCartButton>
          </div>
          <div className="prose prose-zinc max-w-none dark:prose-invert">
            <p>{product.description}</p>
          </div>
        </div>
      </section>
      <ProductSection title="منتجات مشابهة" products={related ?? []} />
    </>
  );
}
