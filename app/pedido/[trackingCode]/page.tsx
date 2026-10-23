import { Suspense } from "react";
import { notFound } from "next/navigation";
import OrderStatusView from "@/app/pedido/[trackingCode]/order-status-view";
import { getCustomerOrderStatus } from "@/lib/data";

export default function OrderStatusPage({ params }: { params: Promise<{ trackingCode: string }> }) {
  return (
    <Suspense fallback={<main className="order-loading">Buscando tu pedido…</main>}>
      <OrderStatusContent params={params} />
    </Suspense>
  );
}

async function OrderStatusContent({ params }: { params: Promise<{ trackingCode: string }> }) {
  const { trackingCode } = await params;
  const order = await getCustomerOrderStatus(trackingCode);
  if (!order) notFound();

  return <OrderStatusView initialOrder={order} />;
}