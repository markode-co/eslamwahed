"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CircleUserRound, Mail, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createClient, hasBrowserSupabaseEnv } from "@/lib/supabase/client";
import { useToast } from "@/components/layout/toast-provider";

function MissingSupabaseConfig() {
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-10">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-emerald-600" />
            إعداد Supabase مطلوب
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-7 text-zinc-600 dark:text-zinc-300">
          <p>صفحة الدخول تحتاج مفاتيح Supabase حتى تعمل المصادقة فعليا.</p>
          <p>
            أنشئ ملف{" "}
            <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-900">
              .env.local
            </code>{" "}
            من{" "}
            <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-900">
              .env.example
            </code>{" "}
            ثم أضف:
          </p>
          <ul className="list-inside list-disc">
            <li>NEXT_PUBLIC_SUPABASE_URL</li>
            <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
          </ul>
          <p>بعدها أعد تشغيل خادم التطوير.</p>
        </CardContent>
      </Card>
    </section>
  );
}

function LoginContent() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/";
  const toast = useToast();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (!hasBrowserSupabaseEnv()) {
    return <MissingSupabaseConfig />;
  }

  const supabase = createClient();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const result =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { phone },
              emailRedirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
            },
          });

    setLoading(false);

    if (result.error) {
      toast({ title: "فشل تسجيل الدخول", description: result.error.message });
      return;
    }

    toast({
      title: mode === "login" ? "تم تسجيل الدخول" : "تم إنشاء الحساب",
    });
    router.refresh();
    router.push(next);
  }

  async function google() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
  }

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-10">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>
            {mode === "login" ? "تسجيل الدخول" : "إنشاء حساب جديد"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <Input
              type="email"
              placeholder="البريد الإلكتروني"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {mode === "signup" ? (
              <Input
                type="tel"
                placeholder="رقم الهاتف"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                minLength={8}
                dir="rtl"
              />
            ) : null}
            <Input
              type="password"
              placeholder="كلمة المرور"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            <Button className="w-full" disabled={loading}>
              <Mail className="h-4 w-4" />
              {loading ? "انتظر..." : mode === "login" ? "دخول" : "تسجيل"}
            </Button>
          </form>
          <Button onClick={google} variant="outline" className="mt-3 w-full">
            <CircleUserRound className="h-4 w-4" />
            المتابعة باستخدام Google
          </Button>
          <button
            className="mt-4 w-full text-sm font-semibold text-emerald-700"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
          >
            {mode === "login"
              ? "ليس لديك حساب؟ سجل الآن"
              : "لديك حساب؟ سجل الدخول"}
          </button>
        </CardContent>
      </Card>
    </section>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <section className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-10">
          جاري التحميل...
        </section>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
