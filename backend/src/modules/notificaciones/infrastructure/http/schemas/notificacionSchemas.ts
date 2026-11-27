import { z } from "@hono/zod-openapi";

export const listarNotificacionesSchema = z.object({
	pagina: z
		.string()
		.regex(/^\d+$/)
		.transform(Number)
		.refine((n) => n >= 1, "La página debe ser mayor o igual a 1")
		.optional()
		.default(1)
		.openapi({ example: "1" }),
	limite: z
		.string()
		.regex(/^\d+$/)
		.transform(Number)
		.refine((n) => n >= 1 && n <= 50, "El límite debe estar entre 1 y 50")
		.optional()
		.default(20)
		.openapi({ example: "20" }),
	soloNoLeidas: z
		.enum(["true", "false"])
		.transform((v) => v === "true")
		.optional()
		.openapi({
			description: "Si es true, devuelve solo las notificaciones no leídas",
		}),
});

export const notificacionIdParamSchema = z.object({
	id: z
		.string()
		.regex(/^\d+$/)
		.transform(Number)
		.refine((n) => n >= 1, "Id de notificación inválido")
		.openapi({ example: "1" }),
});

// ── Respuestas (sólo documentación OpenAPI) ──────────────────────────────────

export const notificacionSchema = z
	.object({
		id: z.number().int().openapi({ example: 1 }),
		tipo: z
			.string()
			.openapi({ example: "autorizacion.asignacion_actualizada" }),
		datos: z.unknown().openapi({
			example: {
				rolesAgregados: ["ADMIN"],
				rolesQuitados: [],
				permisosDirectosCambiados: false,
			},
		}),
		leida: z.boolean().openapi({ example: false }),
		leidaEn: z.iso.datetime().nullable(),
		createdAt: z.iso.datetime(),
	})
	.openapi("Notificacion");

export const notificacionesPaginaSchema = z
	.object({
		datos: z.array(notificacionSchema),
		pagina: z.number().int().openapi({ example: 1 }),
		totalElementos: z.number().int().openapi({ example: 5 }),
		totalPaginas: z.number().int().openapi({ example: 1 }),
		noLeidas: z.number().int().openapi({ example: 2 }),
	})
	.openapi("NotificacionesPagina");

export const marcarTodasLeidasRespuestaSchema = z
	.object({
		actualizadas: z.number().int().openapi({ example: 3 }),
	})
	.openapi("MarcarTodasLeidasRespuesta");
