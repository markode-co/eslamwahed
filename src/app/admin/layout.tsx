import Link from "next/link";
import { Boxes, LayoutDashboard, ReceiptText, Users } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen md:grid-cols-[240px_1fr]">
      <aside className="border-b border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 md:border-b-0 md:border-l">
        <h2 className="mb-4 text-lg font-black">إدارة اسلام وحيد</h2>
        <nav className="grid gap-2 text-sm font-semibold">
          <Link className="flex items-center gap-2 rounded-md p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900" href="/admin"><LayoutDashboard className="h-4 w-4" /> الرئيسية</Link>
          <Link className="flex items-center gap-2 rounded-md p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900" href="/admin/products"><Boxes className="h-4 w-4" /> المنتجات</Link>
          <Link className="flex items-center gap-2 rounded-md p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900" href="/admin/orders"><ReceiptText className="h-4 w-4" /> الطلبات</Link>
          <Link className="flex items-center gap-2 rounded-md p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900" href="/admin/users"><Users className="h-4 w-4" /> المستخدمون</Link>
        </nav>
      </aside>
      <div>{children}</div>
    </div>
  );
}
