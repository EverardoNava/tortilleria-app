"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Clock3, PackageCheck, RefreshCw, Store } from "lucide-react";
import type { CustomerOrderStatus } from "@/lib/order-types";

const statusLabels: Record<CustomerOrderStatus["status"], string> = {
  PENDING: "Pedido recibido",
  READY: "Listo para entrega",
  COMPLETED: "Pedido completado",
  CANCELLED: "Pedido cancelado",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-MX", {
    timeZone: "America/Mexico_City",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatPrice(amount: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 2 }).format(amount);
}

export default function OrderStatusView({ initialOrder }: { initialOrder: CustomerOrderStatus }) {
  const [order, setOrder] = useState(initialOrder);
  const [lastChecked, setLastChecked] = useState(new Date());

  useEffect(() => {
    const refresh = async () => {
      try {
        const response = await fetch(`/api/orders/${initialOrder.trackingCode}`, { cache: "no-store" });
        if (response.ok) {
          const result = await response.json();
          setOrder(result.order as CustomerOrderStatus);
          setLastChecked(new Date());
        }
      } catch {
        setLastChecked(new Date());
      }
    };

    const interval = window.setInterval(refresh, 30000);
    return () => window.clearInterval(interval);
  }, [initialOrder.trackingCode]);

  const progress = order.status === "PENDING" ? 1 : order.status === "READY" ? 2 : order.status === "COMPLETED" ? 3 : 0;

  return (
    <main className="order-page status-page">
      <header className="order-header">
        <Link className="brand order-brand" href="/"><span className="brand-mark">CA</span><span>CABRERA<small>TORTILLERÍA DE BARRIO</small></span></Link>
        <Link className="button button-light order-back-button" href="/"><ArrowLeft size={16} /> Volver a Cabrera</Link>
      </header>
      <section className="status-card">
        <div className="confirmation-mark"><Store size={28} /></div>
        <p className="eyebrow"><span /> SEGUIMIENTO DE PEDIDO</p>
        <h1>{statusLabels[order.status]}<em>.</em></h1>
        <p className="status-code">Folio <strong>{order.trackingCode}</strong></p>
        {order.status !== "CANCELLED" ? (
          <div className={`order-progress progress-${progress}`} aria-label={`Estado: ${statusLabels[order.status]}`}>
            <div className="progress-step"><span><Check size={14} /></span><strong>Recibido</strong></div>
            <div className="progress-line" />
            <div className="progress-step"><span><PackageCheck size={15} /></span><strong>Listo</strong></div>
            <div className="progress-line" />
            <div className="progress-step"><span><Check size={14} /></span><strong>Completado</strong></div>
          </div>
        ) : <p className="order-cancelled">Comunícate con la tortillería si necesitas ayuda con el pedido cancelado.</p>}
        <div className="status-details">
          <div><Clock3 size={17} /><span>Estimado de preparación<strong>{formatDate(order.estimatedFulfillmentAt)}</strong></span></div>
          <div><RefreshCw size={16} /><span>Última revisión<strong>{formatDate(lastChecked.toISOString())}</strong></span></div>
        </div>
        <div className="status-receipt">
          {order.items.map((item) => <p key={`${item.productName}-${item.unit}`}>{item.quantity} × {item.productName}<span>{formatPrice(item.unitPrice * item.quantity)}</span></p>)}
          <footer><strong>Total</strong><strong>{formatPrice(order.total)}</strong></footer>
        </div>
        <Link className="button button-muted confirmation-home" href="/">← Volver a Cabrera</Link>
      </section>
      <footer className="order-footer"><span>© 2026 Cabrera · Hecho con maíz y cariño.</span><span>Pedidos · Lun–Sáb 07:00–19:00 · Dom 08:00–14:00 CDMX</span></footer>
    </main>
  );
}