import { z } from "zod";

export const createUserSchema = z.object({
  email: z.email("Debe ser un email válido"),
  name: z.string().optional(),
  password: z
    .string("La contraseña es requerida")
    .min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export const updateUserSchema = z.object({
  email: z.email("Debe ser un email válido").optional(),
  name: z.string().optional(),
});

export const userIdSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, "El ID debe ser un número válido")
    .transform(Number),
});

export const getAllUsersSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional().default(1),
  limit: z.string().regex(/^\d+$/).transform(Number).optional().default(10),
  email: z.email("Debe ser un email válido").optional(),
});
