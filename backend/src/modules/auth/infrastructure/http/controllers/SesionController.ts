import type { Context } from "hono";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { CerrarSesionUseCase } from "../../../application/useCases/CerrarSesionUseCase";
import type { ListarSesionesUseCase } from "../../../application/useCases/ListarSesionesUseCase";
import type { AuthEnv } from "../middlewares/authMiddleware";
import { getRefreshTokenCookie } from "../refreshTokenCookie";
import { sesionIdSchema } from "../schemas/authSchemas";

/** Sesiones abiertas del usuario autenticado: listarlas y cerrarlas una a una. */
export class SesionController extends BaseController {
	constructor(
		private readonly useCases: {
			listar: ListarSesionesUseCase;
			cerrar: CerrarSesionUseCase;
		},
	) {
		super();
	}

	listar = (c: Context<AuthEnv>): Promise<Response> =>
		this.executeSafely(c, async () => {
			const sesiones = await this.useCases.listar.ejecutar(
				c.get("usuario").id,
				getRefreshTokenCookie(c),
			);
			return this.ok(c, sesiones);
		});

	cerrar = (c: Context<AuthEnv>): Promise<Response> =>
		this.executeSafely(c, async () => {
			const { id } = validate(sesionIdSchema, c.req.param());
			await this.useCases.cerrar.ejecutar(c.get("usuario").id, id);
			return this.ok(c, { mensaje: "Sesión cerrada" });
		});
}
