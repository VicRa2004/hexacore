import type { Context } from "hono";
import type { CrearPermisoUseCase } from "../../../application/useCases/CrearPermisoUseCase";
import type { EliminarPermisoUseCase } from "../../../application/useCases/EliminarPermisoUseCase";
import type { ObtenerPermisosUseCase } from "../../../application/useCases/ObtenerPermisosUseCase";
import type { ObtenerPermisoUseCase } from "../../../application/useCases/ObtenerPermisoUseCase";
import type { ObtenerPermisosUsuarioUseCase } from "../../../application/useCases/ObtenerPermisosUsuarioUseCase";
import type { ActualizarPermisoUseCase } from "../../../application/useCases/ActualizarPermisoUseCase";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import {
	crearPermisoSchema,
	permisoIdSchema,
	actualizarPermisoSchema,
	usuarioIdParamSchema,
} from "../schemas/permisoSchemas";

export class PermisoController extends BaseController {
	// Objeto con nombres y no posicional: varios casos de uso tienen la misma forma (`ejecutar(id)`).
	constructor(
		private readonly useCases: {
			obtenerTodos: ObtenerPermisosUseCase;
			obtenerUno: ObtenerPermisoUseCase;
			crear: CrearPermisoUseCase;
			actualizar: ActualizarPermisoUseCase;
			eliminar: EliminarPermisoUseCase;
			obtenerPorUsuario: ObtenerPermisosUsuarioUseCase;
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
			const { id } = validate(permisoIdSchema, c.req.param());
			return this.ok(c, await this.useCases.obtenerUno.ejecutar(id));
		});

	crear = (c: Context): Promise<Response> =>
		this.executeSafely(c, async () => {
			const dto = validate(crearPermisoSchema, await c.req.json());
			return this.created(c, await this.useCases.crear.ejecutar(dto));
		});

	actualizar = (c: Context): Promise<Response> =>
		this.executeSafely(c, async () => {
			const { id } = validate(permisoIdSchema, c.req.param());
			const dto = validate(actualizarPermisoSchema, await c.req.json());
			return this.ok(c, await this.useCases.actualizar.ejecutar(id, dto));
		});

	eliminar = (c: Context): Promise<Response> =>
		this.executeSafely(c, async () => {
			const { id } = validate(permisoIdSchema, c.req.param());
			await this.useCases.eliminar.ejecutar(id);
			return c.body(null, 204);
		});

	obtenerPorUsuario = (c: Context): Promise<Response> =>
		this.executeSafely(c, async () => {
			const { usuarioId } = validate(usuarioIdParamSchema, {
				usuarioId: c.req.param("usuarioId"),
			});
			return this.ok(
				c,
				await this.useCases.obtenerPorUsuario.ejecutar(usuarioId),
			);
		});
}
