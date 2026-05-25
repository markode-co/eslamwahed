import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,#10b98133,transparent_35%),linear-gradient(135deg,#082f2c,#111827_60%,#18181b)] text-white">
      <div className="mx-auto grid min-h-[540px] max-w-7xl items-center gap-8 px-4 py-14 md:grid-cols-[1.05fr_.95fr]">
        <div className="space-y-6">
          <span className="inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-2 text-sm font-semibold backdrop-blur"><Sparkles className="h-4 w-4" /> تجربة تسوق عربية سريعة وآمنة</span>
          <h1 className="max-w-2xl text-4xl font-black leading-tight md:text-6xl">اسلام وحيد</h1>
          <p className="max-w-xl text-lg leading-8 text-zinc-200">متجر احترافي يدعم السلة، الطلبات، لوحة الإدارة، الدفع عند الاستلام، وتطبيق PWA قابل للتثبيت.</p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg"><Link href="/products">تسوق الآن <ArrowLeft className="h-5 w-5" /></Link></Button>
            <Button asChild size="lg" variant="secondary"><Link href="/auth/login">إنشاء حساب</Link></Button>
          </div>
        </div>
        <div className="relative min-h-80 overflow-hidden rounded-lg border border-white/10 bg-white/10 p-4 shadow-2xl backdrop-blur">
          <div className="grid h-full grid-cols-2 gap-3">
            {["منتجات مميزة", "عروض محدودة", "شحن محسوب", "دعم عربي"].map((item, index) => (
              <div key={item} className="flex min-h-36 flex-col justify-end rounded-lg bg-white/10 p-4 ring-1 ring-white/10" style={{ transform: `translateY(${index % 2 ? 24 : 0}px)` }}>
                <span className="text-4xl font-black text-emerald-300">0{index + 1}</span>
                <strong>{item}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
