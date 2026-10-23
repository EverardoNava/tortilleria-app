import { Suspense } from "react";
import OrderForm from "@/app/pedido/order-form";
import { getPublicProducts } from "@/lib/data";

export default function OrderPage() {
  return (
    <Suspense fallback={<main className="order-loading">Abriendo el mostrador…</main>}>
      <OrderContent />
    </Suspense>
  );
}

async function OrderContent() {
  const products = await getPublicProducts();
  return <OrderForm products={products} />;
}