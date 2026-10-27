import { z } from "@hono/zod-openapi";

export const obtenerAuditoriaSchema = z.object({
	pagina: z.string().regex(/^\d+$/).transform(Number).optional().default(1),
	limite: z.string().regex(/^\d+$/).transform(Number).optional().default(20),
	evento: z.string().trim().min(1).max(150).optional(),
	usuarioId: z.string().regex(/^\d+$/).transform(Number).optional(),
});

// ── Respuestas (sólo documentación OpenAPI) ──────────────────────────────────

const registroAuditoriaSchema = z
	.object({
		id: z.number().int().openapi({ example: 1 }),
		evento: z.string().openapi({ example: "usuario.creado" }),
		datos: z
			.unknown()
			.openapi({ example: { id: 7, email: "ana@example.com" } }),
		usuarioId: z.number().int().nullable().openapi({ example: 1 }),
		requestId: z.string().nullable(),
		ocurridoEn: z.iso.datetime(),
	})
	.openapi("RegistroAuditoria");

export const auditoriaPaginaSchema = z.object({
	datos: z.array(registroAuditoriaSchema),
	pagina: z.number().int().openapi({ example: 1 }),
	totalElementos: z.number().int().openapi({ example: 10 }),
	totalPaginas: z.number().int().openapi({ example: 1 }),
});
