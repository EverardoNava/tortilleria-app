import type { OrderStatusValue } from "@/lib/order-validation";

export type OrderItemSummary = {
  productName: string;
  unit: string;
  quantity: number;
  unitPrice: number;
};

export type AdminOrder = {
  id: string;
  trackingCode: string;
  customerName: string;
  deliveryAddress: string;
  phone: string;
  status: OrderStatusValue;
  total: number;
  createdAt: string;
  estimatedFulfillmentAt: string;
  items: OrderItemSummary[];
};

export type CustomerOrderStatus = {
  trackingCode: string;
  status: OrderStatusValue;
  total: number;
  createdAt: string;
  estimatedFulfillmentAt: string;
  items: OrderItemSummary[];
};

export type DailySalesReport = {
  date: string;
  orderCount: number;
  grossSales: number;
  averageOrder: number;
  orders: Array<{
    trackingCode: string;
    total: number;
    completedAt: string;
    itemCount: number;
  }>;
};