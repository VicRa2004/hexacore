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

export const recuperarPasswordSchema = z.object({
	email: z.email("El email es obligatorio y debe ser válido"),
});

const tokenCuentaSchema = z.string().min(1, "El token es obligatorio").max(256);

export const restablecerPasswordSchema = z.object({
	token: tokenCuentaSchema,
	password: passwordSchema,
});

export const verificarEmailSchema = z.object({ token: tokenCuentaSchema });

export const cambiarPasswordSchema = z.object({
	passwordActual: z.string().min(1, "La contraseña actual es obligatoria"),
	passwordNueva: passwordSchema,
});

export const refreshTokenSchema = z.object({
	refreshToken: z.string().min(1, "El refresh token es obligatorio"),
});

export const sesionIdSchema = z.object({
	id: z
		.string()
		.regex(/^\d+$/, "El ID debe ser un número válido")
		.transform(Number),
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

export const sesionSchema = z
	.object({
		id: z.number().int(),
		userAgent: z.string().nullable(),
		ultimoUso: z.iso.datetime(),
		expiraEn: z.iso.datetime(),
		actual: z.boolean(),
	})
	.openapi("Sesion");

// ── Verificación en dos pasos (TOTP) ─────────────────────────────────────────

/** Código de 6 dígitos de la app o código de recuperación `XXXXX-XXXXX`. */
const codigoDosFactoresSchema = z
	.string("El código es obligatorio")
	.trim()
	.min(6, "El código es obligatorio")
	.max(20);

export const codigoSchema = z.object({ codigo: codigoDosFactoresSchema });

export const desactivarDosFactoresSchema = z.object({
	password: z.string().min(1, "La contraseña es obligatoria"),
	codigo: codigoDosFactoresSchema,
});

export const loginDosFactoresSchema = z.object({
	token2fa: z.string().min(1, "Falta el token del primer paso").max(1024),
	codigo: codigoDosFactoresSchema,
});

export const requiere2faResponseSchema = z
	.object({
		requiere2fa: z.literal(true),
		token2fa: z.string().openapi({
			description: "Token intermedio (5 min) para POST /api/auth/login/2fa",
		}),
	})
	.openapi("Requiere2faResponse");

export const estadoDosFactoresSchema = z
	.object({
		activo: z.boolean(),
		codigosRestantes: z.number().int(),
	})
	.openapi("EstadoDosFactores");

export const altaDosFactoresSchema = z
	.object({
		secreto: z
			.string()
			.openapi({ example: "JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP" }),
		otpauthUri: z.string(),
	})
	.openapi("AltaDosFactores");

export const codigosRecuperacionSchema = z
	.object({
		codigosRecuperacion: z
			.string()
			.array()
			.openapi({ example: ["ABCDE-FGHIJ"] }),
	})
	.openapi("CodigosRecuperacion");
