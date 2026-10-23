import { NextResponse } from "next/server";
import { getAdminOrders } from "@/lib/data";
import { getAdminSession } from "@/lib/auth";

export async function GET() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ message: "Inicia sesión para continuar." }, { status: 401 });
  }

  return NextResponse.json({ orders: await getAdminOrders() });
}