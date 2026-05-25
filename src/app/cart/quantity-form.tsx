"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function CartQuantityForm({ itemId, quantity }: { itemId: string; quantity: number }) {
  const router = useRouter();
  async function update(next: number) {
    await fetch("/api/cart", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: itemId, quantity: next }) });
    router.refresh();
  }
  return (
    <div className="mt-3 inline-flex items-center gap-2 rounded-md border border-zinc-200 p-1 dark:border-zinc-800">
      <Button type="button" size="sm" variant="ghost" onClick={() => update(Math.max(1, quantity - 1))}>-</Button>
      <span className="min-w-8 text-center font-bold">{quantity}</span>
      <Button type="button" size="sm" variant="ghost" onClick={() => update(quantity + 1)}>+</Button>
    </div>
  );
}
