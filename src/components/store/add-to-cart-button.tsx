"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { useToast } from "@/components/layout/toast-provider";
import { cn } from "@/lib/utils/cn";

type Props = ButtonProps & {
  productId: string;
  quantity?: number;
  selectedColor?: string | null;
  selectedSize?: string | null;
};

export function AddToCartButton({ productId, quantity = 1, selectedColor, selectedSize, className, children, ...props }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();

  async function add() {
    setLoading(true);
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: productId, quantity, selected_color: selectedColor, selected_size: selectedSize }),
    });
    setLoading(false);

    if (res.status === 401) {
      router.push(`/auth/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }
    if (!res.ok) {
      toast({ title: "تعذر إضافة المنتج", description: "راجع الاختيارات والمخزون ثم حاول مرة أخرى." });
      return;
    }
    toast({ title: "تمت الإضافة للسلة" });
    router.refresh();
  }

  return (
    <Button onClick={add} disabled={loading || props.disabled} className={cn(className)} {...props}>
      {loading ? "جاري الإضافة..." : children}
    </Button>
  );
}
