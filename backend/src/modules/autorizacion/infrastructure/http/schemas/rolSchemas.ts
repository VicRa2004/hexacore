import { z } from "@hono/zod-openapi";
import { permisoDtoSchema } from "./permisoSchemas";

/** ID numérico de los parámetros de la ruta */
export const rolIdSchema = z.object({
	id: z
		.string()
		.regex(/^\d+$/, "El ID debe ser un número válido")
		.transform(Number),
});

const idsSchema = z.array(z.number().int().positive());

/** Cuerpo para crear o reemplazar un rol. El nombre se guarda en mayúsculas (`ADMIN`). */
export const guardarRolSchema = z.object({
	nombre: z
		.string()
		.trim()
		.toUpperCase()
		.min(1, "nombre no puede estar vacío")
		.max(150, "nombre no puede superar 150 caracteres")
		.openapi({ example: "SOPORTE" }),
	descripcion: z
		.string()
		.trim()
		.max(500, "descripcion no puede superar 500 caracteres")
		.nullish(),
	permisoIds: idsSchema.default([]).openapi({ example: [1, 2] }),
});

/** Roles y permisos directos de un usuario (lectura y reemplazo completo). */
export const asignacionUsuarioSchema = z
	.object({
		rolIds: idsSchema.openapi({ example: [1] }),
		permisosDirectos: z
			.array(
				z.object({
					permisoId: z.number().int().positive(),
					/** true = conceder, false = denegar aunque venga de un rol */
					concedido: z.boolean(),
				}),
			)
			.openapi({ example: [{ permisoId: 4, concedido: false }] }),
	})
	.openapi("AsignacionUsuario");

// ── Respuestas (sólo documentación OpenAPI) ──────────────────────────────────

export const rolDtoSchema = z
	.object({
		id: z.number().int().openapi({ example: 1 }),
		nombre: z.string().openapi({ example: "ADMIN" }),
		descripcion: z.string().nullable(),
		permisos: z.array(permisoDtoSchema),
	})
	.openapi("RolDto");
