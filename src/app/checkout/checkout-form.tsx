"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/layout/toast-provider";

export function CheckoutForm() {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  async function submit(formData: FormData) {
    setLoading(true);
    const payload = Object.fromEntries(formData.entries());
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    setLoading(false);
    if (!res.ok) {
      toast({ title: "تعذر إنشاء الطلب", description: json.error ?? "راجع البيانات وحاول مرة أخرى." });
      return;
    }
    toast({ title: "تم إرسال الطلب", description: "سيتم التواصل معك لتأكيد الطلب." });
    router.push(`/orders?created=${json.order_number}`);
    router.refresh();
  }

  return (
    <form action={submit} className="grid gap-4 rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
      <Input name="customer_name" placeholder="الاسم بالكامل" required />
      <Input name="phone" placeholder="رقم الهاتف" required />
      <Input name="email" type="email" placeholder="البريد الإلكتروني" />
      <Input name="city" placeholder="المدينة" required />
      <Textarea name="address" placeholder="العنوان التفصيلي" required />
      <Input name="coupon_code" placeholder="كود الخصم إن وجد" />
      <Textarea name="notes" placeholder="ملاحظات إضافية" />
      <Button disabled={loading}>{loading ? "جاري الحفظ..." : "تأكيد الطلب"}</Button>
    </form>
  );
}
