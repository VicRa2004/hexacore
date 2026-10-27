import { z } from "@hono/zod-openapi";

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

export const crearUsuarioSchema = z.object({
	email: z.email("Debe ser un email válido"),
	nombre: z
		.string()
		.trim()
		.min(2, "El nombre debe tener al menos 2 caracteres"),
	password: passwordSchema,
});

export const actualizarUsuarioSchema = z.object({
	email: z.email("Debe ser un email válido").optional(),
	nombre: z
		.string()
		.trim()
		.min(2, "El nombre debe tener al menos 2 caracteres")
		.optional(),
	password: passwordSchema.optional(),
});

export const usuarioIdSchema = z.object({
	id: z
		.string()
		.regex(/^\d+$/, "El ID debe ser un número válido")
		.transform(Number),
});

export const obtenerUsuariosSchema = z.object({
	pagina: z.string().regex(/^\d+$/).transform(Number).optional().default(1),
	limite: z.string().regex(/^\d+$/).transform(Number).optional().default(10),
	// Búsqueda parcial: basta un fragmento del email
	email: z.string().trim().min(1).max(128).optional(),
});

// ── Respuestas (sólo documentación OpenAPI) ──────────────────────────────────

export const usuarioDtoSchema = z
	.object({
		id: z.number().int().openapi({ example: 1 }),
		nombre: z.string().openapi({ example: "Juan Pérez" }),
		email: z.email().openapi({ example: "usuario@example.com" }),
		isActivo: z.boolean().openapi({ example: true }),
		roles: z.array(z.string()).openapi({ example: ["USUARIO"] }),
	})
	.openapi("UsuarioDto");

export const usuarioPaginaSchema = z.object({
	datos: z.array(usuarioDtoSchema),
	pagina: z.number().int().openapi({ example: 1 }),
	totalElementos: z.number().int().openapi({ example: 10 }),
	totalPaginas: z.number().int().openapi({ example: 1 }),
});
