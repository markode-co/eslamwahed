import Link from "next/link";
import { Hero } from "@/components/store/hero";
import { ProductSection } from "@/components/store/product-section";
import { Countdown } from "@/components/store/countdown";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  getHomeData,
  getSessionProfile,
  isStoreAdminEmail,
} from "@/lib/supabase/queries";

export default async function Home() {
  const [{ featured, newest, best, categories, reviews }, { user }] =
    await Promise.all([getHomeData(), getSessionProfile()]);

  return (
    <>
      <Hero isLoggedIn={Boolean(user)} isAdmin={isStoreAdminEmail(user?.email)} />
      <Countdown />
      <section className="mx-auto max-w-7xl px-4 py-10">
        <h2 className="mb-5 text-2xl font-black">الأقسام</h2>
        {categories.length ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/products?category=${category.slug}`}
                className="rounded-lg border border-zinc-200 bg-white p-5 font-bold transition hover:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-950"
              >
                {category.name}
                {category.description ? (
                  <span className="mt-2 block text-sm font-normal text-zinc-500">
                    {category.description}
                  </span>
                ) : null}
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            title="لم تتم إضافة أقسام بعد"
            description="أضف الأقسام من Supabase أو لوحة التحكم لتظهر هنا."
          />
        )}
      </section>
      <ProductSection title="المنتجات المميزة" products={featured} />
      <ProductSection title="وصل حديثا" products={newest} />
      <ProductSection title="الأكثر مبيعا" products={best} />
      <section className="mx-auto max-w-7xl px-4 py-10">
        <h2 className="mb-5 text-2xl font-black">تقييمات العملاء</h2>
        {reviews.length ? (
          <div className="grid gap-4 md:grid-cols-3">
            {reviews.map((review) => (
              <Card key={review.id} className="p-5">
                <p className="text-amber-500">★★★★★</p>
                <p className="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-300">
                  {review.comment}
                </p>
                <strong className="mt-4 block">
                  {review.profiles?.full_name ?? "عميل"}
                </strong>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            title="لا توجد تقييمات حتى الآن"
            description="بعد أن يراجع العملاء المنتجات ستظهر التقييمات هنا مباشرة."
          />
        )}
      </section>
    </>
  );
}
