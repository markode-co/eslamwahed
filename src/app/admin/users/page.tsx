import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { requireAdmin } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils/format";

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireAdmin();
  const params = await searchParams;
  const supabase = await createClient();
  let query = supabase.from("users").select("*, orders(id, total, status)").order("created_at", { ascending: false });
  if (params.q) query = query.or(`full_name.ilike.%${params.q}%,email.ilike.%${params.q}%,phone.ilike.%${params.q}%`);
  const { data: users } = await query;

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-black">إدارة المستخدمين</h1>
      <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <Table>
          <THead><TR><TH>الاسم</TH><TH>البريد</TH><TH>الهاتف</TH><TH>العنوان</TH><TH>الطلبات</TH><TH>الدور</TH><TH>تاريخ التسجيل</TH></TR></THead>
          <TBody>
            {users?.map((user) => (
              <TR key={user.id}>
                <TD className="font-bold">{user.full_name ?? "-"}</TD>
                <TD>{user.email ?? "-"}</TD>
                <TD>{user.phone ?? "-"}</TD>
                <TD>{user.address ?? "-"}</TD>
                <TD>{user.orders?.length ?? 0}</TD>
                <TD>{user.role}</TD>
                <TD>{formatDate(user.created_at)}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </div>
    </section>
  );
}
