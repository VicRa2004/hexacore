import type { Context } from "hono";
import type { ActualizarRolUseCase } from "../../../application/useCases/ActualizarRolUseCase";
import type { CrearRolUseCase } from "../../../application/useCases/CrearRolUseCase";
import type { EliminarRolUseCase } from "../../../application/useCases/EliminarRolUseCase";
import type { ObtenerRolesUseCase } from "../../../application/useCases/ObtenerRolesUseCase";
import type { ObtenerRolUseCase } from "../../../application/useCases/ObtenerRolUseCase";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import { guardarRolSchema, rolIdSchema } from "../schemas/rolSchemas";

export class RolController extends BaseController {
	constructor(
		private readonly useCases: {
			obtenerTodos: ObtenerRolesUseCase;
			obtenerUno: ObtenerRolUseCase;
			crear: CrearRolUseCase;
			actualizar: ActualizarRolUseCase;
			eliminar: EliminarRolUseCase;
		},
	) {
		super();
	}

	obtenerTodos = (c: Context): Promise<Response> =>
		this.executeSafely(c, async () =>
			this.ok(c, await this.useCases.obtenerTodos.ejecutar()),
		);

	obtenerUno = (c: Context): Promise<Response> =>
		this.executeSafely(c, async () => {
			const { id } = validate(rolIdSchema, c.req.param());
			return this.ok(c, await this.useCases.obtenerUno.ejecutar(id));
		});

	crear = (c: Context): Promise<Response> =>
		this.executeSafely(c, async () => {
			const dto = validate(guardarRolSchema, await c.req.json());
			return this.created(c, await this.useCases.crear.ejecutar(dto));
		});

	actualizar = (c: Context): Promise<Response> =>
		this.executeSafely(c, async () => {
			const { id } = validate(rolIdSchema, c.req.param());
			const dto = validate(guardarRolSchema, await c.req.json());
			return this.ok(c, await this.useCases.actualizar.ejecutar(id, dto));
		});

	eliminar = (c: Context): Promise<Response> =>
		this.executeSafely(c, async () => {
			const { id } = validate(rolIdSchema, c.req.param());
			await this.useCases.eliminar.ejecutar(id);
			return c.body(null, 204);
		});
}
