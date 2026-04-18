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

export const loginSchema = z.object({
  email: z.email("El email es requerido y debe ser válido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.email("El email es requerido y debe ser válido"),
  password: passwordSchema,
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "El refresh token es requerido"),
});
