import type { Context } from "hono";
import { stream } from "hono/streaming";
import { contexto } from "@/core/shared/infrastructure/contexto";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { ExportarAuditoriaUseCase } from "../../../application/useCases/ExportarAuditoriaUseCase";
import type { ObtenerAuditoriaUseCase } from "../../../application/useCases/ObtenerAuditoriaUseCase";
import {
	exportarAuditoriaSchema,
	obtenerAuditoriaSchema,
} from "../schemas/auditoriaSchemas";

interface AuditoriaCasos {
	obtenerAuditoria: ObtenerAuditoriaUseCase;
	exportarAuditoria: ExportarAuditoriaUseCase;
}

export class AuditoriaController extends BaseController {
	constructor(private readonly casos: AuditoriaCasos) {
		super();
	}

	obtenerTodos = (c: Context): Promise<Response> =>
		this.executeSafely(c, async () => {
			const filtros = validate(obtenerAuditoriaSchema, c.req.query());
			return this.ok(c, await this.casos.obtenerAuditoria.ejecutar(filtros));
		});

	exportar = (c: Context): Promise<Response> =>
		this.executeSafely(c, async () => {
			const filtros = validate(exportarAuditoriaSchema, c.req.query());
			const ctx = { ...contexto.actual() };
			const fecha = new Date().toISOString().slice(0, 10);

			c.header("Content-Type", "text/csv; charset=utf-8");
			c.header(
				"Content-Disposition",
				`attachment; filename="auditoria-${fecha}.csv"`,
			);
			c.header("Cache-Control", "no-store");

			return stream(c, (s) =>
				contexto.ejecutar(ctx, async () => {
					for await (const trozo of this.casos.exportarAuditoria.ejecutar(
						filtros,
					)) {
						await s.write(trozo);
					}
				}),
			);
		});
}
