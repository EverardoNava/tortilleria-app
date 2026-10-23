"use client";

import { useState } from "react";
import { ArrowDownToLine, ReceiptText, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import type { DailySalesReport } from "@/lib/order-types";

function formatPrice(amount: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(amount);
}

export default function SalesReport({ initialReport }: { initialReport: DailySalesReport }) {
  const [report, setReport] = useState(initialReport);
  const [loading, setLoading] = useState(false);

  async function refreshReport() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/sales", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message ?? "No pudimos actualizar el reporte.");
      setReport(result.report as DailySalesReport);
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "No pudimos actualizar el reporte.");
    } finally {
      setLoading(false);
    }
  }

  async function downloadReport() {
    try {
      const response = await fetch("/api/admin/sales?format=csv", { cache: "no-store" });
      if (!response.ok) throw new Error("No pudimos generar el archivo de ventas.");
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = url;
      link.download = `ventas-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "No pudimos generar el archivo de ventas.");
    }
  }

  return (
    <section className="admin-feature-panel">
      <div className="feature-heading">
        <div><p className="eyebrow"><span /> CORTE DEL DÍA · HORA CDMX</p><h1>Ventas <em>de hoy.</em></h1><p>{report.date} · Solo pedidos completados.</p></div>
        <div className="report-actions"><button className="button button-muted refresh-button" onClick={refreshReport} disabled={loading}><RefreshCw size={16} className={loading ? "spin-icon" : ""} />Actualizar</button><button className="button add-product-button" onClick={downloadReport}><ArrowDownToLine size={16} />Descargar CSV</button></div>
      </div>
      <div className="sales-stats">
        <div><span>VENTA CERRADA</span><strong>{formatPrice(report.grossSales)}</strong></div>
        <div><span>PEDIDOS COMPLETADOS</span><strong>{report.orderCount}</strong></div>
        <div><span>VENTA PROMEDIO</span><strong>{formatPrice(report.averageOrder)}</strong></div>
      </div>
      <div className="sales-orders-heading"><div><h2>Detalle del corte</h2><span>{report.orders.length} ventas</span></div></div>
      <div className="sales-order-list">
        {report.orders.map((order) => (
          <article key={order.trackingCode}><div className="sales-receipt-icon"><ReceiptText size={17} /></div><div><strong>{order.trackingCode}</strong><span>{new Intl.DateTimeFormat("es-MX", { timeZone: "America/Mexico_City", dateStyle: "short", timeStyle: "short" }).format(new Date(order.completedAt))} · {order.itemCount} artículos</span></div><strong>{formatPrice(order.total)}</strong></article>
        ))}
        {!report.orders.length && <div className="orders-empty"><ReceiptText size={25} /><p>Aún no hay ventas completadas hoy.</p></div>}
      </div>
    </section>
  );
}