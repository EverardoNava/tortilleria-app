import "server-only";

import { prisma } from "@/lib/prisma";
import { sampleProducts, type PublicProduct } from "@/lib/sample-products";
import { getStoreDayRange } from "@/lib/store-hours";
import type { AdminOrder, CustomerOrderStatus, DailySalesReport } from "@/lib/order-types";

export async function getPublicProducts(): Promise<PublicProduct[]> {
  try {
    const products = await prisma.product.findMany({
      where: { available: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        unit: true,
        image: true,
        tag: true,
      },
    });

    return products.map((product) => ({ ...product, price: Number(product.price), tag: product.tag ?? "" }));
  } catch {
    return sampleProducts;
  }
}

export async function getAdminProducts(): Promise<PublicProduct[]> {
  const products = await prisma.product.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      unit: true,
      image: true,
      tag: true,
    },
  });

  return products.map((product) => ({ ...product, price: Number(product.price), tag: product.tag ?? "" }));
}

export async function getAdminOrders(): Promise<AdminOrder[]> {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { items: { orderBy: { productName: "asc" } } },
  });

  return orders.map((order) => ({
    id: order.id,
    trackingCode: order.trackingCode,
    customerName: order.customerName,
    deliveryAddress: order.deliveryAddress,
    phone: order.phone,
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
  }));
}

export async function getCustomerOrderStatus(trackingCode: string): Promise<CustomerOrderStatus | null> {
  const order = await prisma.order.findUnique({
    where: { trackingCode },
    select: {
      trackingCode: true,
      status: true,
      total: true,
      createdAt: true,
      estimatedFulfillmentAt: true,
      items: { select: { productName: true, unit: true, quantity: true, unitPrice: true } },
    },
  });

  if (!order) return null;
  return {
    ...order,
    total: Number(order.total),
    createdAt: order.createdAt.toISOString(),
    estimatedFulfillmentAt: order.estimatedFulfillmentAt.toISOString(),
    items: order.items.map((item) => ({ ...item, unitPrice: Number(item.unitPrice) })),
  };
}

export async function getDailySalesReport(date: Date = new Date()): Promise<DailySalesReport> {
  const range = getStoreDayRange(date);
  const orders = await prisma.order.findMany({
    where: { status: "COMPLETED", updatedAt: { gte: range.start, lt: range.end } },
    orderBy: { updatedAt: "desc" },
    include: { items: { select: { quantity: true } } },
  });
  const grossSales = orders.reduce((sum, order) => sum + Number(order.total), 0);

  return {
    date: new Intl.DateTimeFormat("es-MX", { timeZone: "America/Mexico_City", dateStyle: "full" }).format(date),
    orderCount: orders.length,
    grossSales: Math.round(grossSales * 100) / 100,
    averageOrder: orders.length ? Math.round((grossSales / orders.length) * 100) / 100 : 0,
    orders: orders.map((order) => ({
      trackingCode: order.trackingCode,
      total: Number(order.total),
      completedAt: order.updatedAt.toISOString(),
      itemCount: order.items.reduce((count, item) => count + item.quantity, 0),
    })),
  };
}