"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Minus, Plus, Store } from "lucide-react";
import type { PublicProduct } from "@/lib/sample-products";
import type { CustomerOrderStatus } from "@/lib/order-types";
import { getStoreHoursStatus } from "@/lib/store-hours";

function formatPrice(amount: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 2 }).format(amount);
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("es-MX", {
    timeZone: "America/Mexico_City",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function OrderForm({ products }: { products: PublicProduct[] }) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [hours, setHours] = useState(() => getStoreHoursStatus());
  const [isClosedModalOpen, setIsClosedModalOpen] = useState(() => !getStoreHoursStatus().isOpen);
  const previousOpenState = useRef(hours.isOpen);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<CustomerOrderStatus | null>(null);

  useEffect(() => {
    const refreshHours = () => {
      const nextHours = getStoreHoursStatus();
      if (previousOpenState.current && !nextHours.isOpen) setIsClosedModalOpen(true);
      previousOpenState.current = nextHours.isOpen;
      setHours(nextHours);
    };
    const interval = window.setInterval(refreshHours, 15000);
    window.addEventListener("focus", refreshHours);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", refreshHours);
    };
  }, []);

  const selectedProducts = products.filter((product) => (quantities[product.id] ?? 0) > 0);
  const estimatedTotal = selectedProducts.reduce((sum, product) => sum + product.price * quantities[product.id], 0);

  function changeQuantity(productId: string, amount: number) {
    setQuantities((current) => {
      const nextQuantity = Math.min(50, Math.max(0, (current[productId] ?? 0) + amount));
      return { ...current, [productId]: nextQuantity };
    });
  }

  async function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);

    const form = new FormData(event.currentTarget);
    const items = selectedProducts.map((product) => ({ productId: product.id, quantity: quantities[product.id] }));
    const street = String(form.get("street") ?? "").trim();
    const neighborhood = String(form.get("neighborhood") ?? "").trim();

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.get("customerName"),
          deliveryAddress: `${street}, ${neighborhood}`,
          phone: form.get("phone"),
          items,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        if (result.code === "STORE_CLOSED") {
          const latestHours = getStoreHoursStatus();
          setHours(latestHours);
          previousOpenState.current = latestHours.isOpen;
          setIsClosedModalOpen(true);
        }
        throw new Error(result.message ?? "No pudimos recibir tu pedido.");
      }
      setOrder(result.order as CustomerOrderStatus);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No pudimos recibir tu pedido.");
      setHours(getStoreHoursStatus());
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="order-page">
      <header className="order-header">
        <Link className="brand order-brand" href="/">
          <span className="brand-mark">CA</span>
          <span>CABRERA<small>TORTILLERÍA DE BARRIO</small></span>
        </Link>
        <Link className="button button-light order-back-button" href="/"><ArrowLeft size={16} /> Volver a Cabrera</Link>
      </header>

      {order ? (
        <section className="order-confirmation">
          <div className="confirmation-mark"><Store size={29} /></div>
          <p className="eyebrow"><span /> PEDIDO EN CAMINO</p>
          <h1>Orden <em>recibida.</em></h1>
          <p className="confirmation-copy">Gracias, ya estamos preparando tus productos. Estimamos tener tu pedido listo alrededor de las <strong>{formatTime(order.estimatedFulfillmentAt)}</strong>.</p>
          <div className="confirmation-receipt">
            <span>FOLIO DE SEGUIMIENTO</span><strong>{order.trackingCode}</strong>
            <div>{order.items.map((item) => <p key={`${item.productName}-${item.unit}`}>{item.quantity} × {item.productName}<span>{formatPrice(item.unitPrice * item.quantity)}</span></p>)}</div>
            <footer><span>Total</span><strong>{formatPrice(order.total)}</strong></footer>
          </div>
          <Link className="button order-submit" href={`/pedido/${order.trackingCode}`}>Ver estado de mi pedido <ArrowRight size={17} /></Link>
          <Link className="confirmation-home" href="/">Volver a Cabrera</Link>
        </section>
      ) : (
        <div className="order-layout">
          <section className="order-intro">
            <p className="eyebrow"><span /> DIRECTO DEL COMAL</p>
            <h1>Pide para<br /><em>llevar.</em></h1>
            <p>Elige tus favoritos y te los preparamos frescos. Para entrega a domicilio, déjanos tus datos.</p>
            <div className={`store-hours-card ${hours.isOpen ? "is-open" : "is-closed"}`}>
              <div className="store-hours-status"><span className="open-dot" /><strong>{hours.isOpen ? "Pedidos abiertos" : "Ahorita estamos cerrados"}</strong><span>{hours.localTime} CDMX</span></div>
              <div className="store-hours-schedule">
                <div><span>Lunes a sábado</span><strong>07:00–19:00</strong></div>
                <div><span>Domingo</span><strong>08:00–14:00</strong></div>
              </div>
            </div>
          </section>

          <form className="order-form" onSubmit={submitOrder}>
            <section className="order-form-section">
              <div className="order-section-heading"><span>01</span><div><h2>Elige del mostrador</h2><p>Cuéntanos qué te preparamos.</p></div></div>
              <div className="order-product-list">
                {products.map((product) => (
                  <article className="order-product" key={product.id}>
                    <div className="order-product-photo" role="img" aria-label={product.name} style={{ backgroundImage: `url("${product.image}")` }} />
                    <div className="order-product-detail"><strong>{product.name}</strong><span>{formatPrice(product.price)} · {product.unit}</span></div>
                    <div className="quantity-control" aria-label={`Cantidad de ${product.name}`}>
                      <button type="button" onClick={() => changeQuantity(product.id, -1)} disabled={!quantities[product.id]} aria-label={`Quitar ${product.name}`}><Minus size={14} /></button>
                      <span>{quantities[product.id] ?? 0}</span>
                      <button type="button" onClick={() => changeQuantity(product.id, 1)} aria-label={`Agregar ${product.name}`}><Plus size={14} /></button>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="order-form-section delivery-section">
              <div className="order-section-heading"><span>02</span><div><h2>Datos de entrega</h2><p>Los usaremos solo para este pedido.</p></div></div>
              <div className="delivery-fields">
                <label>Nombre<input name="customerName" autoComplete="name" required minLength={2} maxLength={100} placeholder="¿A nombre de quién?" /></label>
                <label>Calle y número<input name="street" autoComplete="address-line1" required minLength={5} maxLength={180} placeholder="Calle y número exterior/interior" /></label>
                <label>Colonia<input name="neighborhood" autoComplete="address-line2" required minLength={2} maxLength={100} placeholder="Colonia o barrio" /></label>
                <label>Teléfono<input name="phone" type="tel" autoComplete="tel" required maxLength={25} placeholder="55 1234 5678" /></label>
              </div>
            </section>

            <div className="order-submit-row">
              <div><span>TOTAL ESTIMADO</span><strong>{formatPrice(estimatedTotal)}</strong><small>Entrega estimada en 45 minutos</small></div>
              <button className="button order-submit" type="submit" disabled={!hours.isOpen || !selectedProducts.length || pending}>
                {pending ? "Enviando…" : "Hacer pedido"}<ArrowRight size={17} />
              </button>
            </div>
            {!hours.isOpen && <p className="order-closed-note">Podrás enviar tu pedido cuando abramos.</p>}
            {error && <p className="order-error" role="alert">{error}</p>}
          </form>
        </div>
      )}

      <footer className="order-footer"><span>© 2026 Cabrera · Hecho con maíz y cariño.</span><span>Pedidos · Lun–Sáb 07:00–19:00 · Dom 08:00–14:00 CDMX</span></footer>

      {!hours.isOpen && isClosedModalOpen && (
        <div className="closed-modal-backdrop" role="presentation">
          <section className="closed-hours-modal" role="alertdialog" aria-modal="true" aria-labelledby="closed-hours-title" aria-describedby="closed-hours-message">
            <div className="closed-modal-mark"><Store size={24} /></div>
            <p className="eyebrow"><span /> CABRERA</p>
            <h2 id="closed-hours-title">Fuera del horario de servicio</h2>
            <p id="closed-hours-message">Ahora no podemos recibir pedidos. Vuelve durante nuestro horario de atención.</p>
            <div className="closed-modal-schedule">
              <div><span>Lunes a sábado</span><strong>07:00–19:00</strong></div>
              <div><span>Domingo</span><strong>08:00–14:00</strong></div>
            </div>
            <button className="button closed-modal-dismiss" type="button" onClick={() => setIsClosedModalOpen(false)}>Entendido</button>
          </section>
        </div>
      )}
    </main>
  );
}