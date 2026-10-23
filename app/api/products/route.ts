import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/product-validation";

export async function POST(request: Request) {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ message: "Inicia sesión para continuar." }, { status: 401 });
  }

  const input = productSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) {
    return NextResponse.json({ message: input.error.issues[0]?.message ?? "Datos inválidos." }, { status: 400 });
  }

  const product = await prisma.product.create({
    data: { ...input.data, tag: input.data.tag || null },
  });

  return NextResponse.json({
    product: { ...product, price: Number(product.price), tag: product.tag ?? "" },
  }, { status: 201 });
}