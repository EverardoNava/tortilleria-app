import "dotenv/config";
import { hash } from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password || password.length < 12) {
    throw new Error("Configura ADMIN_EMAIL y ADMIN_PASSWORD (mínimo 12 caracteres) antes del seed.");
  }

  await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash: await hash(password, 12) },
    create: { email, passwordHash: await hash(password, 12) },
  });

  const productCount = await prisma.product.count();
  if (productCount === 0) {
    await prisma.product.createMany({
      data: [
        {
          name: "Tortillas de maíz",
          description: "Maíz nixtamalizado, recién salido del comal.",
          price: 20,
          unit: "el kilo",
          image: "https://i.pinimg.com/originals/61/85/7f/61857f196e5696a943cd42a53d2da3e9.webp",
          tag: "Favorito",
          sortOrder: 1,
        },
        {
          name: "Totopos caseros",
          description: "Crujientes, doraditos y hechos con nuestras tortillas.",
          price: 10,
          unit: "la bolsa",
          image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=85",
          tag: "Para compartir",
          sortOrder: 2,
        },
        {
          name: "Masa fresca",
          description: "Molida cada mañana. Lista para tus recetas favoritas.",
          price: 18,
          unit: "el kilo",
          image: "https://tse3.mm.bing.net/th/id/OIP.-9AxC1sMaT0ipYodvBr3yAHaE8?r=0&rs=1&pid=ImgDetMain&o=7&rm=3",
          tag: "Del día",
          sortOrder: 3,
        },
      ],
    });
  }
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());