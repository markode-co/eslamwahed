"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  LogOut,
  Moon,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sun,
  UserRound,
} from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/layout/toast-provider";
import { useTheme } from "./theme-provider";

export function Header({
  userEmail,
  isAdmin,
}: {
  userEmail?: string | null;
  isAdmin?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [isPending, startTransition] = useTransition();
  const { theme, setTheme } = useTheme();
  const toast = useToast();

  function logout() {
    startTransition(async () => {
      const response = await fetch("/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok && !response.redirected) {
        toast({
          title: "تعذر تسجيل الخروج",
          description: "حاول مرة أخرى بعد لحظات.",
        });
        return;
      }

      router.replace("/");
      router.refresh();
    });
  }

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3">
        <Link
          href="/"
          className="text-xl font-black text-emerald-700 dark:text-emerald-400"
        >
          اسلام وحيد
        </Link>
        <nav className="hidden items-center gap-4 text-sm font-semibold md:flex">
          <Link href="/products">المنتجات</Link>
          <Link href="/orders">طلباتي</Link>
          {isAdmin ? (
            <Link
              href="/admin"
              className="inline-flex items-center gap-1 text-emerald-700"
            >
              <ShieldCheck className="h-4 w-4" />
              الإدارة
            </Link>
          ) : null}
        </nav>
        <form
          className="order-last flex w-full flex-1 items-center gap-2 md:order-none md:min-w-80"
          onSubmit={(e) => {
            e.preventDefault();
            router.push(`/products?q=${encodeURIComponent(q)}`);
          }}
        >
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ابحث عن منتج..."
            className="h-10"
          />
          <Button size="icon" aria-label="بحث">
            <Search className="h-4 w-4" />
          </Button>
        </form>
        {isAdmin ? (
          <Button asChild size="sm" variant="secondary">
            <Link href="/admin">
              <LayoutDashboard className="h-4 w-4" />
              لوحة التحكم
            </Link>
          </Button>
        ) : null}
        <Button
          size="icon"
          variant="ghost"
          aria-label="تبديل الوضع"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>
        <Button asChild size="icon" variant="ghost" aria-label="السلة">
          <Link href="/cart">
            <ShoppingBag className="h-5 w-5" />
          </Link>
        </Button>
        {userEmail ? (
          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            disabled={isPending}
          >
            <LogOut className="h-4 w-4" />
            {isPending ? "جاري الخروج..." : "خروج"}
          </Button>
        ) : (
          <Button asChild size="sm">
            <Link href="/auth/login">
              <UserRound className="h-4 w-4" />
              دخول
            </Link>
          </Button>
        )}
      </div>
    </header>
  );
}
