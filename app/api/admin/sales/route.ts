import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getDailySalesReport } from "@/lib/data";

function csvCell(value: string | number) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

export async function GET(request: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ message: "Inicia sesión para continuar." }, { status: 401 });
  }

  const report = await getDailySalesReport();
  if (new URL(request.url).searchParams.get("format") !== "csv") {
    return NextResponse.json({ report });
  }

  const rows = [
    ["Folio", "Fecha y hora de cierre", "Artículos", "Total MXN"],
    ...report.orders.map((order) => [
      order.trackingCode,
      new Intl.DateTimeFormat("es-MX", { timeZone: "America/Mexico_City", dateStyle: "short", timeStyle: "short" }).format(new Date(order.completedAt)),
      order.itemCount,
      order.total.toFixed(2),
    ]),
    ["TOTAL", "", report.orderCount, report.grossSales.toFixed(2)],
  ];
  const csv = `\uFEFF${rows.map((row) => row.map(csvCell).join(",")).join("\r\n")}`;
  const day = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Mexico_City", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="ventas-${day}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}