import { OpenAPIHono } from "@hono/zod-openapi";
import {
	errorResponse,
	jsonResponse,
	protectedErrorResponses,
} from "@/core/shared/infrastructure/http/openapi";

import type { AuthMiddleware } from "@/modules/auth";
import type { PermisoGuard } from "@/core/shared/infrastructure/http/permisoGuard";

import type { AsignacionController } from "../controllers/AsignacionController";
import { usuarioIdParamSchema } from "../schemas/permisoSchemas";
import { asignacionUsuarioSchema } from "../schemas/rolSchemas";

const tags = ["Asignaciones"];
const security = [{ bearerAuth: [] }];

/** Roles y permisos directos de cada usuario. */
export class AsignacionRouter {
	public readonly router: OpenAPIHono;

	constructor(
		private readonly authMiddleware: AuthMiddleware,
		private readonly requierePermisoMiddleware: PermisoGuard,
		private readonly controller: AsignacionController,
	) {
		this.router = new OpenAPIHono();
		this.iniciarRutas();
	}

	private iniciarRutas(): void {
		const docs = this.router.openAPIRegistry;

		this.router.use(this.authMiddleware.handle);

		docs.registerPath({
			method: "get",
			path: "/usuarios/{usuarioId}",
			tags,
			security,
			summary: "Obtener los roles y permisos directos de un usuario",
			request: { params: usuarioIdParamSchema },
			responses: {
				200: jsonResponse(asignacionUsuarioSchema, "Asignación del usuario"),
				...protectedErrorResponses("asignaciones:leer"),
				404: errorResponse("Usuario no encontrado"),
			},
		});
		this.router.get(
			"/usuarios/:usuarioId",
			this.requierePermisoMiddleware.handle("asignaciones", "leer"),
			this.controller.obtener,
		);

		docs.registerPath({
			method: "put",
			path: "/usuarios/{usuarioId}",
			tags,
			security,
			summary: "Reemplazar los roles y permisos directos de un usuario",
			request: {
				params: usuarioIdParamSchema,
				body: {
					required: true,
					content: { "application/json": { schema: asignacionUsuarioSchema } },
				},
			},
			responses: {
				200: jsonResponse(asignacionUsuarioSchema, "Asignación guardada"),
				400: errorResponse("Validación fallida"),
				...protectedErrorResponses("asignaciones:actualizar"),
				404: errorResponse("Usuario, rol o permiso no encontrado"),
			},
		});
		this.router.put(
			"/usuarios/:usuarioId",
			this.requierePermisoMiddleware.handle("asignaciones", "actualizar"),
			this.controller.actualizar,
		);
	}
}
