import type { Context } from "hono";
import type { ActualizarAsignacionUsuarioUseCase } from "../../../application/useCases/ActualizarAsignacionUsuarioUseCase";
import type { ObtenerAsignacionUsuarioUseCase } from "../../../application/useCases/ObtenerAsignacionUsuarioUseCase";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import { usuarioIdParamSchema } from "../schemas/permisoSchemas";
import { asignacionUsuarioSchema } from "../schemas/rolSchemas";

export class AsignacionController extends BaseController {
	constructor(
		private readonly useCases: {
			obtener: ObtenerAsignacionUsuarioUseCase;
			actualizar: ActualizarAsignacionUsuarioUseCase;
		},
	) {
		super();
	}

	obtener = (c: Context): Promise<Response> =>
		this.executeSafely(c, async () => {
			const { usuarioId } = validate(usuarioIdParamSchema, c.req.param());
			return this.ok(c, await this.useCases.obtener.ejecutar(usuarioId));
		});

	actualizar = (c: Context): Promise<Response> =>
		this.executeSafely(c, async () => {
			const { usuarioId } = validate(usuarioIdParamSchema, c.req.param());
			const dto = validate(asignacionUsuarioSchema, await c.req.json());
			return this.ok(
				c,
				await this.useCases.actualizar.ejecutar(usuarioId, dto),
			);
		});
}
