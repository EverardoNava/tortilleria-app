import { NextResponse } from "next/server";
import { getCustomerOrderStatus } from "@/lib/data";

export async function GET(_request: Request, { params }: { params: Promise<{ trackingCode: string }> }) {
  const { trackingCode } = await params;
  if (!/^[0-9A-F]{32}$/.test(trackingCode)) {
    return NextResponse.json({ message: "No encontramos ese pedido." }, { status: 404 });
  }

  const order = await getCustomerOrderStatus(trackingCode);
  if (!order) return NextResponse.json({ message: "No encontramos ese pedido." }, { status: 404 });

  return NextResponse.json({ order });
}