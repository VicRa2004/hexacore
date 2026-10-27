import type { Context } from "hono";
import type { CrearUsuarioUseCase } from "../../../application/useCases/CrearUsuarioUseCase";
import type { EliminarUsuarioUseCase } from "../../../application/useCases/EliminarUsuarioUseCase";
import type { ObtenerUsuariosUseCase } from "../../../application/useCases/ObtenerUsuariosUseCase";
import type { ObtenerUsuarioUseCase } from "../../../application/useCases/ObtenerUsuarioUseCase";
import type { ActualizarUsuarioUseCase } from "../../../application/useCases/ActualizarUsuarioUseCase";
import {
	crearUsuarioSchema,
	obtenerUsuariosSchema,
	actualizarUsuarioSchema,
	usuarioIdSchema,
} from "../schemas/usuarioSchemas";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";

export class UsuarioController extends BaseController {
	// Objeto con nombres y no posicional: varios casos de uso tienen la misma forma (`ejecutar(id)`).
	constructor(
		private readonly useCases: {
			crear: CrearUsuarioUseCase;
			obtenerTodos: ObtenerUsuariosUseCase;
			obtenerUno: ObtenerUsuarioUseCase;
			actualizar: ActualizarUsuarioUseCase;
			eliminar: EliminarUsuarioUseCase;
		},
	) {
		super();
	}

	crear = (c: Context): Promise<Response> =>
		this.executeSafely(c, async () => {
			const dto = validate(crearUsuarioSchema, await c.req.json());
			return this.created(c, await this.useCases.crear.ejecutar(dto));
		});

	obtenerTodos = (c: Context): Promise<Response> =>
		this.executeSafely(c, async () => {
			const dto = validate(obtenerUsuariosSchema, c.req.query());
			return this.ok(c, await this.useCases.obtenerTodos.ejecutar(dto));
		});

	obtenerUno = (c: Context): Promise<Response> =>
		this.executeSafely(c, async () => {
			const { id } = validate(usuarioIdSchema, c.req.param());
			return this.ok(c, await this.useCases.obtenerUno.ejecutar(id));
		});

	actualizar = (c: Context): Promise<Response> =>
		this.executeSafely(c, async () => {
			const { id } = validate(usuarioIdSchema, c.req.param());
			const dto = validate(actualizarUsuarioSchema, await c.req.json());
			return this.ok(c, await this.useCases.actualizar.ejecutar(id, dto));
		});

	eliminar = (c: Context): Promise<Response> =>
		this.executeSafely(c, async () => {
			const { id } = validate(usuarioIdSchema, c.req.param());
			await this.useCases.eliminar.ejecutar(id);
			return c.body(null, 204);
		});
}
