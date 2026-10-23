import { z } from "zod";

export const createOrderSchema = z.object({
  customerName: z.string().trim().min(2, "Escribe tu nombre.").max(100),
  deliveryAddress: z.string().trim().min(8, "Escribe una dirección completa.").max(300),
  phone: z.string().trim().refine((value) => {
    const digits = value.replace(/\D/g, "");
    return digits.length >= 10 && digits.length <= 15;
  }, "Escribe un teléfono válido de 10 a 15 dígitos."),
  items: z.array(z.object({
    productId: z.string().min(1),
    quantity: z.coerce.number().int().min(1).max(50),
  })).min(1, "Agrega al menos un producto."),
});

export const orderStatusSchema = z.enum(["PENDING", "READY", "COMPLETED", "CANCELLED"]);

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type OrderStatusValue = z.infer<typeof orderStatusSchema>;