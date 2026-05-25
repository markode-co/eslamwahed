import { store } from "@/lib/utils/format";

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 py-8 text-sm text-zinc-500 dark:border-zinc-800">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} {store.name}. جميع الحقوق محفوظة.</p>
        <p>الدعم الرسمي: <a className="font-semibold text-emerald-700" href={`mailto:${store.email}`}>{store.email}</a></p>
      </div>
    </footer>
  );
}
