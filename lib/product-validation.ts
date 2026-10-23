import { z } from "zod";

const productImageSchema = z.string().trim().min(1).max(500).refine(
  (value) => value.startsWith("/") || /^https?:\/\//i.test(value),
  "Usa una URL http(s) o una ruta local.",
);

export const productSchema = z.object({
  name: z.string().trim().min(2, "Escribe un nombre de al menos 2 caracteres.").max(80),
  description: z.string().trim().min(5, "Agrega una descripción.").max(240),
  price: z.coerce.number().finite().positive("El precio debe ser mayor que cero.").max(100000),
  unit: z.string().trim().min(1, "Indica la unidad de venta.").max(30),
  image: productImageSchema,
  tag: z.string().trim().max(40).optional().default(""),
});

export type ProductInput = z.infer<typeof productSchema>;

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()),
  password: z.string().min(1).max(200),
});