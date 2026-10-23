import { compare } from "bcryptjs";
import { NextResponse } from "next/server";
import { createSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/product-validation";

export async function POST(request: Request) {
  const input = loginSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) {
    return NextResponse.json({ message: "Revisa el correo y la contraseña." }, { status: 400 });
  }

  const user = await prisma.adminUser.findUnique({ where: { email: input.data.email } });
  const passwordMatches = user ? await compare(input.data.password, user.passwordHash) : false;
  if (!user || !passwordMatches) {
    return NextResponse.json({ message: "Correo o contraseña incorrectos." }, { status: 401 });
  }

  await createSession(user.id);
  return NextResponse.json({ message: "Sesión iniciada." });
}