import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { requireAdmin } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  await requireAdmin();
  const url = new URL(request.url);
  const table = url.searchParams.get("table") ?? "orders";
  const format = url.searchParams.get("format") ?? "csv";
  if (!["orders", "products", "users"].includes(table)) {
    return NextResponse.json({ error: "Invalid table" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data } = await supabase.from(table).select("*");
  const worksheet = XLSX.utils.json_to_sheet(data ?? []);
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, worksheet, table);

  if (format === "xlsx") {
    const buffer = XLSX.write(book, { type: "buffer", bookType: "xlsx" });
    return new NextResponse(buffer, {
      headers: {
        "content-type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "content-disposition": `attachment; filename="${table}.xlsx"`,
      },
    });
  }

  const csv = XLSX.utils.sheet_to_csv(worksheet);
  return new NextResponse(csv, {
    headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="${table}.csv"` },
  });
}
