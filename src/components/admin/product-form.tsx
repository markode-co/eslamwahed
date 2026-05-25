"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/layout/toast-provider";
import { Product } from "@/lib/types";

export function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>(product?.images ?? []);

  async function upload(file: File) {
    const supabase = createClient();
    const path = `products/${crypto.randomUUID()}-${file.name}`;
    const { error } = await supabase.storage.from("products").upload(path, file, { upsert: false });
    if (error) {
      toast({ title: "فشل رفع الصورة", description: error.message });
      return;
    }
    const { data } = supabase.storage.from("products").getPublicUrl(path);
    setImageUrls((prev) => [...prev, data.publicUrl]);
  }

  async function submit(formData: FormData) {
    setLoading(true);
    const supabase = createClient();
    const payload = {
      name: String(formData.get("name")),
      slug: String(formData.get("slug")),
      short_description: String(formData.get("short_description") ?? ""),
      description: String(formData.get("description") ?? ""),
      price: Number(formData.get("price")),
      sale_price: formData.get("sale_price") ? Number(formData.get("sale_price")) : null,
      stock: Number(formData.get("stock")),
      status: String(formData.get("status")),
      colors: String(formData.get("colors") ?? "").split(",").map((x) => x.trim()).filter(Boolean),
      sizes: String(formData.get("sizes") ?? "").split(",").map((x) => x.trim()).filter(Boolean),
      images: imageUrls,
      is_featured: formData.get("is_featured") === "on",
    };
    const result = product
      ? await supabase.from("products").update(payload).eq("id", product.id)
      : await supabase.from("products").insert(payload);
    setLoading(false);
    if (result.error) {
      toast({ title: "فشل حفظ المنتج", description: result.error.message });
      return;
    }
    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form action={submit} className="grid gap-4 rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
      <Input name="name" placeholder="اسم المنتج" defaultValue={product?.name} required />
      <Input name="slug" placeholder="slug-example" defaultValue={product?.slug} required />
      <Input name="price" type="number" placeholder="السعر" defaultValue={product?.price} required />
      <Input name="sale_price" type="number" placeholder="سعر الخصم" defaultValue={product?.sale_price ?? ""} />
      <Input name="stock" type="number" placeholder="المخزون" defaultValue={product?.stock ?? 0} required />
      <select name="status" defaultValue={product?.status ?? "active"} className="h-11 rounded-md border border-zinc-200 bg-white px-3 dark:border-zinc-800 dark:bg-zinc-950">
        <option value="active">active</option><option value="draft">draft</option><option value="out_of_stock">out_of_stock</option><option value="archived">archived</option>
      </select>
      <Input name="colors" placeholder="الألوان مفصولة بفواصل" defaultValue={product?.colors?.join(", ")} />
      <Input name="sizes" placeholder="المقاسات مفصولة بفواصل" defaultValue={product?.sizes?.join(", ")} />
      <Input name="short_description" placeholder="وصف مختصر" defaultValue={product?.short_description ?? ""} />
      <Textarea name="description" placeholder="وصف المنتج" defaultValue={product?.description ?? ""} />
      <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" name="is_featured" defaultChecked={product?.is_featured} /> منتج مميز</label>
      <Input type="file" accept="image/*" multiple onChange={(e) => Array.from(e.target.files ?? []).forEach(upload)} />
      {imageUrls.length ? <div className="text-sm text-zinc-500">{imageUrls.length} صورة جاهزة</div> : null}
      <Button disabled={loading}>{loading ? "جاري الحفظ..." : "حفظ المنتج"}</Button>
    </form>
  );
}
