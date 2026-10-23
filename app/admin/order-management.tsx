"use client";

import { useState } from "react";
import { ClipboardList, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import type { AdminOrder } from "@/lib/order-types";
import type { OrderStatusValue } from "@/lib/order-validation";

const statusLabels: Record<OrderStatusValue, string> = {
  PENDING: "Pendiente",
  READY: "Listo",
  COMPLETED: "Completado",
  CANCELLED: "Cancelado",
};

function formatPrice(amount: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(amount);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-MX", { timeZone: "America/Mexico_City", dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

export default function OrderManagement({ initialOrders }: { initialOrders: AdminOrder[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [loading, setLoading] = useState(false);

  async function refreshOrders() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/orders", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message ?? "No pudimos actualizar los pedidos.");
      setOrders(result.orders as AdminOrder[]);
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "No pudimos actualizar los pedidos.");
    } finally {
      setLoading(false);
    }
  }

  async function changeStatus(order: AdminOrder, status: OrderStatusValue) {
    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message ?? "No pudimos cambiar el estado.");
      setOrders((current) => current.map((item) => item.id === order.id ? { ...item, status: result.order.status } : item));
      toast.success(`Pedido ${statusLabels[status].toLocaleLowerCase("es-MX")}`);
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "No pudimos cambiar el estado.");
    }
  }

  return (
    <section className="admin-feature-panel">
      <div className="feature-heading">
        <div><p className="eyebrow"><span /> MOSTRADOR DE HOY</p><h1>Pedidos <em>entrantes.</em></h1><p>Confirma y actualiza el avance de cada entrega.</p></div>
        <button className="button button-muted refresh-button" onClick={refreshOrders} disabled={loading}><RefreshCw size={16} className={loading ? "spin-icon" : ""} />Actualizar</button>
      </div>
      <div className="orders-list">
        <div className="orders-list-heading"><span>PEDIDO</span><span>CLIENTE / ENTREGA</span><span>TOTAL</span><span>ESTADO</span></div>
        {orders.map((order) => (
          <article className="order-admin-row" key={order.id}>
            <div className="order-admin-reference"><strong>{order.trackingCode}</strong><span>{formatDate(order.createdAt)}</span></div>
            <div className="order-admin-customer"><strong>{order.customerName}</strong><span>{order.deliveryAddress}</span><a href={`tel:${order.phone}`}>{order.phone}</a><small>{order.items.map((item) => `${item.quantity} × ${item.productName}`).join(" · ")}</small></div>
            <strong className="order-admin-total">{formatPrice(order.total)}</strong>
            <label className={`order-status-select status-${order.status.toLowerCase()}`}><span className="sr-only">Estado de {order.trackingCode}</span><select value={order.status} onChange={(event) => changeStatus(order, event.target.value as OrderStatusValue)}>{Object.entries(statusLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
          </article>
        ))}
        {!orders.length && <div className="orders-empty"><ClipboardList size={25} /><p>Todavía no hay pedidos. Los nuevos aparecerán aquí.</p></div>}
      </div>
    </section>
  );
}