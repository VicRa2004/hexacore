import type { Context } from "hono";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { AuthEnv } from "@/modules/auth";
import type { ListarNotificacionesUseCase } from "../../../application/useCases/ListarNotificacionesUseCase";
import type { MarcarNotificacionLeidaUseCase } from "../../../application/useCases/MarcarNotificacionLeidaUseCase";
import type { MarcarTodasLeidasUseCase } from "../../../application/useCases/MarcarTodasLeidasUseCase";
import {
	listarNotificacionesSchema,
	notificacionIdParamSchema,
} from "../schemas/notificacionSchemas";

interface NotificacionCasos {
	listar: ListarNotificacionesUseCase;
	marcarLeida: MarcarNotificacionLeidaUseCase;
	marcarTodasLeidas: MarcarTodasLeidasUseCase;
}

export class NotificacionController extends BaseController {
	constructor(private readonly casos: NotificacionCasos) {
		super();
	}

	listar = (c: Context<AuthEnv>): Promise<Response> =>
		this.executeSafely(c, async () => {
			const query = validate(listarNotificacionesSchema, c.req.query());
			const usuarioId = c.get("usuario").id;
			return this.ok(
				c,
				await this.casos.listar.ejecutar({
					usuarioId,
					pagina: query.pagina,
					limite: query.limite,
					soloNoLeidas: query.soloNoLeidas,
				}),
			);
		});

	marcarLeida = (c: Context<AuthEnv>): Promise<Response> =>
		this.executeSafely(c, async () => {
			const { id } = validate(notificacionIdParamSchema, c.req.param());
			const usuarioId = c.get("usuario").id;
			return this.ok(c, await this.casos.marcarLeida.ejecutar(id, usuarioId));
		});

	marcarTodasLeidas = (c: Context<AuthEnv>): Promise<Response> =>
		this.executeSafely(c, async () => {
			const usuarioId = c.get("usuario").id;
			return this.ok(c, await this.casos.marcarTodasLeidas.ejecutar(usuarioId));
		});
}
