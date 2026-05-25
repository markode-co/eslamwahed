"use client";

import { useEffect, useState } from "react";

export function Countdown() {
  const [now, setNow] = useState(Date.now());
  const target = new Date();
  target.setDate(target.getDate() + 7);
  target.setHours(23, 59, 59, 999);
  const diff = Math.max(0, target.getTime() - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 60000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section className="bg-emerald-700 py-6 text-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 md:flex-row">
        <h2 className="text-xl font-black">عروض الأسبوع تنتهي خلال</h2>
        <div className="flex gap-3 text-center">
          {[["أيام", days], ["ساعات", hours], ["دقائق", minutes]].map(([label, value]) => (
            <div key={label} className="min-w-20 rounded-lg bg-white/15 px-4 py-3">
              <strong className="block text-2xl">{value}</strong>
              <span className="text-xs">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
