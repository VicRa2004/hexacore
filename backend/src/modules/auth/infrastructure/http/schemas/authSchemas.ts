import { z } from "@hono/zod-openapi";
import { usuarioDtoSchema } from "@/core/usuario";

const passwordSchema = z
	.string("La contraseña es obligatoria")
	.min(12, "La contraseña debe tener al menos 12 caracteres")
	.regex(/[A-Z]/, "La contraseña debe incluir al menos una mayúscula")
	.regex(/[a-z]/, "La contraseña debe incluir al menos una minúscula")
	.regex(/[0-9]/, "La contraseña debe incluir al menos un número")
	.regex(
		/[^A-Za-z0-9]/,
		"La contraseña debe incluir al menos un carácter especial",
	);

export const loginSchema = z.object({
	email: z.email("El email es obligatorio y debe ser válido"),
	password: z.string().min(1, "La contraseña es obligatoria"),
});

export const registroSchema = z.object({
	nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
	email: z.email("El email es obligatorio y debe ser válido"),
	password: passwordSchema,
});

export const refreshTokenSchema = z.object({
	refreshToken: z.string().min(1, "El refresh token es obligatorio"),
});

// ── Respuestas (sólo documentación OpenAPI) ──────────────────────────────────

const accessTokenSchema = z
	.string()
	.openapi({ example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." });

export const authResponseSchema = z
	.object({
		accessToken: accessTokenSchema,
		usuario: usuarioDtoSchema,
	})
	.openapi("AuthResponse");

export const refreshResponseSchema = z.object({
	accessToken: accessTokenSchema,
});

export const mensajeResponseSchema = z.object({
	mensaje: z.string().openapi({ example: "Sesión cerrada correctamente" }),
});
