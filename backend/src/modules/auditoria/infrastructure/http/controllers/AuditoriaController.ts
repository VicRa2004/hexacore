import type { Context } from "hono";
import type { ObtenerAuditoriaUseCase } from "../../../application/useCases/ObtenerAuditoriaUseCase";
import { obtenerAuditoriaSchema } from "../schemas/auditoriaSchemas";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";

export class AuditoriaController extends BaseController {
	constructor(private readonly obtenerAuditoria: ObtenerAuditoriaUseCase) {
		super();
	}

	ejecutar = (c: Context): Promise<Response> =>
		this.executeSafely(c, async () => {
			const filtros = validate(obtenerAuditoriaSchema, c.req.query());
			return this.ok(c, await this.obtenerAuditoria.ejecutar(filtros));
		});
}
