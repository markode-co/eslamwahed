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
  const [uploading, setUploading] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>(product?.images ?? []);

  async function upload(file: File) {
    setUploading(true);
    try {
      const supabase = createClient();
      const path = `products/${crypto.randomUUID()}-${file.name}`;
      const { error } = await supabase.storage
        .from("products")
        .upload(path, file, { upsert: false });

      if (error) {
        toast({
          title: "فشل رفع الصورة",
          description:
            "تأكد من تشغيل supabase/schema.sql وإنشاء bucket باسم products.",
        });
        return;
      }

      const { data } = supabase.storage.from("products").getPublicUrl(path);
      setImageUrls((prev) => [...prev, data.publicUrl]);
    } finally {
      setUploading(false);
    }
  }

  async function submit(formData: FormData) {
    setLoading(true);
    const payload = {
      name: String(formData.get("name")),
      slug: String(formData.get("slug")),
      category_id: null,
      short_description: String(formData.get("short_description") ?? ""),
      description: String(formData.get("description") ?? ""),
      price: Number(formData.get("price")),
      sale_price: formData.get("sale_price")
        ? Number(formData.get("sale_price"))
        : null,
      stock: Number(formData.get("stock")),
      status: String(formData.get("status")),
      colors: String(formData.get("colors") ?? "")
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean),
      sizes: String(formData.get("sizes") ?? "")
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean),
      images: imageUrls,
      is_featured: formData.get("is_featured") === "on",
    };

    const response = await fetch(
      product ? `/api/admin/products/${product.id}` : "/api/admin/products",
      {
        method: product ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    const result = await response.json();
    setLoading(false);

    if (!response.ok) {
      toast({
        title: "فشل حفظ المنتج",
        description: result.error ?? "راجع البيانات ثم حاول مرة أخرى.",
      });
      return;
    }

    toast({ title: "تم حفظ المنتج" });
    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form
      action={submit}
      className="grid gap-4 rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"
    >
      <Input
        name="name"
        placeholder="اسم المنتج"
        defaultValue={product?.name}
        required
      />
      <Input
        name="slug"
        placeholder="slug-example"
        defaultValue={product?.slug}
        required
      />
      <Input
        name="price"
        type="number"
        placeholder="السعر"
        defaultValue={product?.price}
        required
      />
      <Input
        name="sale_price"
        type="number"
        placeholder="سعر الخصم"
        defaultValue={product?.sale_price ?? ""}
      />
      <Input
        name="stock"
        type="number"
        placeholder="المخزون"
        defaultValue={product?.stock ?? 0}
        required
      />
      <select
        name="status"
        defaultValue={product?.status ?? "active"}
        className="h-11 rounded-md border border-zinc-200 bg-white px-3 dark:border-zinc-800 dark:bg-zinc-950"
      >
        <option value="active">نشط</option>
        <option value="draft">مسودة</option>
        <option value="out_of_stock">نفد المخزون</option>
        <option value="archived">مؤرشف</option>
      </select>
      <Input
        name="colors"
        placeholder="الألوان مفصولة بفواصل"
        defaultValue={product?.colors?.join(", ")}
      />
      <Input
        name="sizes"
        placeholder="المقاسات مفصولة بفواصل"
        defaultValue={product?.sizes?.join(", ")}
      />
      <Input
        name="short_description"
        placeholder="وصف مختصر"
        defaultValue={product?.short_description ?? ""}
      />
      <Textarea
        name="description"
        placeholder="وصف المنتج"
        defaultValue={product?.description ?? ""}
      />
      <label className="flex items-center gap-2 text-sm font-semibold">
        <input
          type="checkbox"
          name="is_featured"
          defaultChecked={product?.is_featured}
        />
        منتج مميز
      </label>
      <Input
        type="file"
        accept="image/*"
        multiple
        disabled={uploading}
        onChange={(e) => Array.from(e.target.files ?? []).forEach(upload)}
      />
      {imageUrls.length ? (
        <div className="text-sm text-zinc-500">
          {imageUrls.length} صورة جاهزة
        </div>
      ) : null}
      <Button disabled={loading || uploading}>
        {loading ? "جاري الحفظ..." : uploading ? "جاري رفع الصور..." : "حفظ المنتج"}
      </Button>
    </form>
  );
}
