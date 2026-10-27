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

export const registroSchema = z.object({
	nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
	email: z.string().email("Ingresa un correo electrónico válido"),
	password: passwordSchema,
});

export const recuperarPasswordSchema = z.object({
	email: z.string().email("Ingresa un correo electrónico válido"),
});

export const restablecerPasswordSchema = z
	.object({
		password: passwordSchema,
		confirmacion: z.string(),
	})
	.refine((d) => d.password === d.confirmacion, {
		message: "Las contraseñas no coinciden",
		path: ["confirmacion"],
	});

export const cambiarPasswordSchema = z
	.object({
		passwordActual: z.string().min(1, "La contraseña actual es requerida"),
		passwordNueva: passwordSchema,
		confirmacion: z.string(),
	})
	.refine((d) => d.passwordNueva === d.confirmacion, {
		message: "Las contraseñas no coinciden",
		path: ["confirmacion"],
	});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegistroInput = z.infer<typeof registroSchema>;
export type RestablecerPasswordInput = z.infer<
	typeof restablecerPasswordSchema
>;
export type CambiarPasswordInput = z.infer<typeof cambiarPasswordSchema>;
