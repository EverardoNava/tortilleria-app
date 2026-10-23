import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { createOrderSchema } from "@/lib/order-validation";
import { prisma } from "@/lib/prisma";
import { getStoreHoursStatus } from "@/lib/store-hours";

export async function POST(request: Request) {
  const input = createOrderSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) {
    return NextResponse.json({ message: input.error.issues[0]?.message ?? "Revisa los datos de tu pedido." }, { status: 400 });
  }

  const hours = getStoreHoursStatus();
  if (!hours.isOpen) {
    return NextResponse.json({
      code: "STORE_CLOSED",
      message: `Ahorita estamos cerrados. Horario de hoy: ${hours.hoursToday} (hora CDMX).`,
    }, { status: 409 });
  }

  const quantities = new Map<string, number>();
  for (const item of input.data.items) {
    quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.quantity);
  }
  if ([...quantities.values()].some((quantity) => quantity > 50)) {
    return NextResponse.json({ message: "El máximo por producto es 50 unidades." }, { status: 400 });
  }

  const products = await prisma.product.findMany({
    where: { id: { in: [...quantities.keys()] }, available: true },
    select: { id: true, name: true, unit: true, price: true },
  });
  if (products.length !== quantities.size) {
    return NextResponse.json({ message: "Un producto del pedido ya no está disponible. Actualiza el catálogo e inténtalo de nuevo." }, { status: 409 });
  }

  const itemData = products.map((product) => ({
    productName: product.name,
    unit: product.unit,
    quantity: quantities.get(product.id)!,
    unitPrice: product.price,
  }));
  const totalCents = itemData.reduce((sum, item) => sum + Math.round(Number(item.unitPrice) * 100) * item.quantity, 0);
  const order = await prisma.order.create({
    data: {
      trackingCode: randomBytes(16).toString("hex").toUpperCase(),
      customerName: input.data.customerName,
      deliveryAddress: input.data.deliveryAddress,
      phone: input.data.phone,
      total: totalCents / 100,
      estimatedFulfillmentAt: new Date(Date.now() + 45 * 60 * 1000),
      items: { create: itemData },
    },
    include: { items: true },
  });

  return NextResponse.json({
    order: {
      trackingCode: order.trackingCode,
      status: order.status,
      total: Number(order.total),
      createdAt: order.createdAt.toISOString(),
      estimatedFulfillmentAt: order.estimatedFulfillmentAt.toISOString(),
      items: order.items.map((item) => ({
        productName: item.productName,
        unit: item.unit,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
      })),
    },
  }, { status: 201 });
}