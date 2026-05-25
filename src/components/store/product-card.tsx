import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/lib/types";
import { formatCurrency } from "@/lib/utils/format";
import { AddToCartButton } from "./add-to-cart-button";

export function ProductCard({ product }: { product: Product }) {
  const price = product.sale_price ?? product.price;
  const image = product.images?.[0] ?? "/product-placeholder.svg";

  return (
    <article className="group overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <Link href={`/products/${product.slug}`} className="relative block aspect-[4/5] overflow-hidden bg-zinc-100 dark:bg-zinc-900">
        <Image src={image} alt={product.name} fill className="object-cover transition duration-500 group-hover:scale-105" sizes="(max-width: 768px) 50vw, 25vw" />
        {product.sale_price ? <Badge className="absolute right-3 top-3 bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300">خصم</Badge> : null}
      </Link>
      <div className="space-y-3 p-4">
        <div>
          <Link href={`/products/${product.slug}`} className="line-clamp-1 font-bold">{product.name}</Link>
          <p className="mt-1 line-clamp-1 text-sm text-zinc-500">{product.categories?.name ?? "منتج"}</p>
        </div>
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="font-black text-emerald-700 dark:text-emerald-400">{formatCurrency(price)}</p>
            {product.sale_price ? <p className="text-xs text-zinc-400 line-through">{formatCurrency(product.price)}</p> : null}
          </div>
          <span className="inline-flex items-center gap-1 text-xs text-amber-500"><Star className="h-4 w-4 fill-current" /> 5.0</span>
        </div>
        <AddToCartButton productId={product.id} disabled={product.stock <= 0} className="w-full">
          <ShoppingCart className="h-4 w-4" /> {product.stock > 0 ? "أضف للسلة" : "نفد المخزون"}
        </AddToCartButton>
      </div>
    </article>
  );
}
