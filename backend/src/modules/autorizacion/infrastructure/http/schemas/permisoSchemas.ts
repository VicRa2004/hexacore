import { z } from "@hono/zod-openapi";

/** ID numérico de los parámetros de la ruta */
export const permisoIdSchema = z.object({
	id: z
		.string()
		.regex(/^\d+$/, "El ID debe ser un número válido")
		.transform(Number),
});

/** Cuerpo para crear un permiso */
export const crearPermisoSchema = z.object({
	recurso: z
		.string()
		.min(1, "recurso no puede estar vacío")
		.max(100, "recurso no puede superar 100 caracteres"),
	accion: z
		.string()
		.min(1, "accion no puede estar vacía")
		.max(50, "accion no puede superar 50 caracteres"),
});

/** Cuerpo para actualizar un permiso */
export const actualizarPermisoSchema = z.object({
	recurso: z
		.string()
		.min(1, "recurso no puede estar vacío")
		.max(100, "recurso no puede superar 100 caracteres"),
	accion: z
		.string()
		.min(1, "accion no puede estar vacía")
		.max(50, "accion no puede superar 50 caracteres"),
});

/** ID del usuario de los parámetros de la ruta */
export const usuarioIdParamSchema = z.object({
	usuarioId: z
		.string()
		.regex(/^\d+$/, "usuarioId debe ser un número válido")
		.transform(Number),
});

// ── Respuestas (sólo documentación OpenAPI) ──────────────────────────────────

export const permisoDtoSchema = z
	.object({
		id: z.number().int().openapi({ example: 1 }),
		recurso: z.string().openapi({ example: "usuarios" }),
		accion: z.string().openapi({ example: "leer" }),
	})
	.openapi("PermisoDto");
