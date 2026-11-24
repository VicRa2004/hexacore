import { z } from "@hono/zod-openapi";
import { CAMPOS_ORDEN_AUDITORIA } from "../../../domain/repository/AuditoriaRepository";

const FECHA_SOLA_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Acepta `YYYY-MM-DD` (inicio o fin del día UTC según `finDeDia`) o un datetime ISO 8601 con zona horaria.
 * Devuelve `null` si el formato o la fecha de calendario son inválidos (ej. `2026-02-30`).
 */
export function parsearFechaFiltro(
	valor: string,
	finDeDia: boolean,
): Date | null {
	if (FECHA_SOLA_REGEX.test(valor)) {
		const fecha = new Date(
			`${valor}T${finDeDia ? "23:59:59.999" : "00:00:00.000"}Z`,
		);
		if (
			Number.isNaN(fecha.getTime()) ||
			!fecha.toISOString().startsWith(valor)
		) {
			return null;
		}
		return fecha;
	}

	if (z.iso.datetime({ offset: true }).safeParse(valor).success) {
		const fecha = new Date(valor);
		return Number.isNaN(fecha.getTime()) ? null : fecha;
	}

	return null;
}

function fechaFiltroSchema(finDeDia: boolean, descripcion: string) {
	return z
		.string()
		.trim()
		.transform((valor, ctx) => {
			const fecha = parsearFechaFiltro(valor, finDeDia);
			if (!fecha) {
				ctx.addIssue({
					code: "custom",
					message:
						"Fecha inválida (usa YYYY-MM-DD o ISO 8601 con zona horaria)",
				});
				return z.NEVER;
			}
			return fecha;
		})
		.optional()
		.openapi({ type: "string", description: descripcion });
}

const filtrosAuditoriaShape = {
	evento: z.string().trim().min(1).max(150).optional().openapi({
		description: "Prefijo del evento (`usuario.` o `usuario.creado`)",
	}),
	usuarioId: z.string().regex(/^\d+$/).transform(Number).optional(),
	desde: fechaFiltroSchema(false, "Fecha inicial (YYYY-MM-DD o ISO 8601)"),
	hasta: fechaFiltroSchema(true, "Fecha final (YYYY-MM-DD o ISO 8601)"),
	orden: z.enum(CAMPOS_ORDEN_AUDITORIA).optional(),
	direccion: z.enum(["asc", "desc"]).optional(),
};

function validarRangoFechas(
	datos: { desde?: Date; hasta?: Date },
	ctx: z.RefinementCtx,
) {
	if (datos.desde && datos.hasta && datos.desde > datos.hasta) {
		ctx.addIssue({
			code: "custom",
			message: "La fecha 'desde' no puede ser posterior a 'hasta'",
			path: ["desde"],
		});
	}
}

export const obtenerAuditoriaSchema = z
	.object({
		pagina: z.string().regex(/^\d+$/).transform(Number).optional().default(1),
		limite: z.string().regex(/^\d+$/).transform(Number).optional().default(20),
		...filtrosAuditoriaShape,
	})
	.superRefine(validarRangoFechas);

export const exportarAuditoriaSchema = z
	.object(filtrosAuditoriaShape)
	.superRefine(validarRangoFechas);

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
