import { z } from "zod";

const passwordSchema = z
  .string("La contraseña es requerida")
  .min(12, "La contraseña debe tener al menos 12 caracteres")
  .regex(/[A-Z]/, "La contraseña debe incluir al menos una mayúscula")
  .regex(/[a-z]/, "La contraseña debe incluir al menos una minúscula")
  .regex(/[0-9]/, "La contraseña debe incluir al menos un número")
  .regex(
    /[^A-Za-z0-9]/,
    "La contraseña debe incluir al menos un carácter especial",
  );

export const createUserSchema = z.object({
  email: z.email("Debe ser un email válido"),
  name: z.string().optional(),
  password: passwordSchema,
});

export const updateUserSchema = z.object({
  email: z.email("Debe ser un email válido").optional(),
  name: z.string().optional(),
  password: passwordSchema.optional(),
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
