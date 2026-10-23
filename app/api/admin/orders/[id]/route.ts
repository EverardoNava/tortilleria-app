import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { orderStatusSchema } from "@/lib/order-validation";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ message: "Inicia sesión para continuar." }, { status: 401 });
  }

  const input = await request.json().catch(() => null) as { status?: unknown } | null;
  const status = orderStatusSchema.safeParse(input?.status);
  if (!status.success) {
    return NextResponse.json({ message: "Selecciona un estado válido." }, { status: 400 });
  }

  const { id } = await params;
  const order = await prisma.order.update({
    where: { id },
    data: { status: status.data },
    select: { id: true, status: true, updatedAt: true },
  }).catch(() => null);
  if (!order) return NextResponse.json({ message: "No encontramos ese pedido." }, { status: 404 });

  return NextResponse.json({ order: { ...order, updatedAt: order.updatedAt.toISOString() } });
}