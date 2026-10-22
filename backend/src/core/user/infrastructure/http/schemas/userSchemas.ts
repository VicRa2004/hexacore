import { z } from "@hono/zod-openapi";

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

export const createUserSchema = z.object({
	email: z.email("Must be a valid email"),
	name: z.string().trim().min(2, "Name must have at least 2 characters"),
	password: passwordSchema,
});

export const updateUserSchema = z.object({
	email: z.email("Must be a valid email").optional(),
	name: z
		.string()
		.trim()
		.min(2, "Name must have at least 2 characters")
		.optional(),
	password: passwordSchema.optional(),
});

export const userIdSchema = z.object({
	id: z.string().regex(/^\d+$/, "ID must be a valid number").transform(Number),
});

export const getAllUsersSchema = z.object({
	page: z.string().regex(/^\d+$/).transform(Number).optional().default(1),
	limit: z.string().regex(/^\d+$/).transform(Number).optional().default(10),
	// Búsqueda parcial: basta un fragmento del email
	email: z.string().trim().min(1).max(128).optional(),
});

// ── Respuestas (sólo documentación OpenAPI) ──────────────────────────────────

export const userDtoSchema = z
	.object({
		id: z.number().int().openapi({ example: 1 }),
		name: z.string().openapi({ example: "John Doe" }),
		email: z.email().openapi({ example: "user@example.com" }),
		isActive: z.boolean().openapi({ example: true }),
		roles: z.array(z.string()).openapi({ example: ["USER"] }),
	})
	.openapi("UserDto");

export const userPageSchema = z.object({
	data: z.array(userDtoSchema),
	page: z.number().int().openapi({ example: 1 }),
	totalItems: z.number().int().openapi({ example: 10 }),
	totalPages: z.number().int().openapi({ example: 1 }),
});
