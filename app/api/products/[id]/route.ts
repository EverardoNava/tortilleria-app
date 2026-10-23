import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/product-validation";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteContext) {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ message: "Inicia sesión para continuar." }, { status: 401 });
  }

  const { id } = await params;
  const input = productSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) {
    return NextResponse.json({ message: input.error.issues[0]?.message ?? "Datos inválidos." }, { status: 400 });
  }

  const exists = await prisma.product.findUnique({ where: { id }, select: { id: true } });
  if (!exists) return NextResponse.json({ message: "No encontramos ese producto." }, { status: 404 });

  const product = await prisma.product.update({
    where: { id },
    data: { ...input.data, tag: input.data.tag || null },
  });

  return NextResponse.json({
    product: { ...product, price: Number(product.price), tag: product.tag ?? "" },
  });
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ message: "Inicia sesión para continuar." }, { status: 401 });
  }

  const { id } = await params;
  const result = await prisma.product.deleteMany({ where: { id } });
  if (!result.count) return NextResponse.json({ message: "No encontramos ese producto." }, { status: 404 });

  return NextResponse.json({ message: "Producto eliminado." });
}