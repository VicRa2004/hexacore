import type { Context } from "hono";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { ActualizarAjustesUseCase } from "../../../application/useCases/ActualizarAjustesUseCase";
import type { ObtenerAjustesPublicosUseCase } from "../../../application/useCases/ObtenerAjustesPublicosUseCase";
import type { ObtenerAjustesUseCase } from "../../../application/useCases/ObtenerAjustesUseCase";
import { actualizarAjustesSchema } from "../schemas/ajustesSchemas";

export class AjustesController extends BaseController {
	constructor(
		private readonly useCases: {
			obtenerPublicos: ObtenerAjustesPublicosUseCase;
			obtener: ObtenerAjustesUseCase;
			actualizar: ActualizarAjustesUseCase;
		},
	) {
		super();
	}

	obtenerPublicos = (c: Context): Promise<Response> =>
		this.executeSafely(c, async () =>
			this.ok(c, await this.useCases.obtenerPublicos.ejecutar()),
		);

	obtener = (c: Context): Promise<Response> =>
		this.executeSafely(c, async () =>
			this.ok(c, await this.useCases.obtener.ejecutar()),
		);

	actualizar = (c: Context): Promise<Response> =>
		this.executeSafely(c, async () => {
			const dto = validate(actualizarAjustesSchema, await c.req.json());
			return this.ok(c, await this.useCases.actualizar.ejecutar(dto));
		});
}
