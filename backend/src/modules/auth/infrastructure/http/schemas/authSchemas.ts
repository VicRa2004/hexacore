import { z } from "@hono/zod-openapi";
import { userDtoSchema } from "@/core/user";

const passwordSchema = z
	.string("Password is required")
	.min(12, "Password must be at least 12 characters")
	.regex(/[A-Z]/, "Password must include at least one uppercase letter")
	.regex(/[a-z]/, "Password must include at least one lowercase letter")
	.regex(/[0-9]/, "Password must include at least one number")
	.regex(
		/[^A-Za-z0-9]/,
		"Password must include at least one special character",
	);

export const loginSchema = z.object({
	email: z.email("Email is required and must be valid"),
	password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
	name: z.string().min(2, "Name must have at least 2 characters"),
	email: z.email("Email is required and must be valid"),
	password: passwordSchema,
});

export const refreshTokenSchema = z.object({
	refreshToken: z.string().min(1, "Refresh token is required"),
});

// ── Respuestas (sólo documentación OpenAPI) ──────────────────────────────────

const accessTokenSchema = z
	.string()
	.openapi({ example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." });

export const authResponseSchema = z
	.object({
		accessToken: accessTokenSchema,
		user: userDtoSchema,
	})
	.openapi("AuthResponse");

export const refreshResponseSchema = z.object({
	accessToken: accessTokenSchema,
});

export const messageResponseSchema = z.object({
	message: z.string().openapi({ example: "Sesión cerrada correctamente" }),
});
