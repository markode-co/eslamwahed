import { ProductForm } from "@/components/admin/product-form";
import { requireAdmin } from "@/lib/supabase/queries";

export default async function NewProductPage() {
  await requireAdmin();
  return <section className="mx-auto max-w-3xl px-4 py-10"><h1 className="mb-6 text-3xl font-black">إضافة منتج</h1><ProductForm /></section>;
}
