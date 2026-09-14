import { z } from "zod";

export const passwordSchema = z
	.string()
	.min(12, "La contraseña debe tener al menos 12 caracteres")
	.regex(/[A-Z]/, "Debe incluir al menos una letra mayúscula")
	.regex(/[a-z]/, "Debe incluir al menos una letra minúscula")
	.regex(/[0-9]/, "Debe incluir al menos un número")
	.regex(/[^A-Za-z0-9]/, "Debe incluir al menos un carácter especial");

export const loginSchema = z.object({
	email: z.string().email("Ingresa un correo electrónico válido"),
	password: z.string().min(1, "La contraseña es requerida"),
});

export const registerSchema = z.object({
	name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
	email: z.string().email("Ingresa un correo electrónico válido"),
	password: passwordSchema,
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
