import { OpenAPIHono } from "@hono/zod-openapi";
import {
	errorResponse,
	jsonResponse,
	protectedErrorResponses,
} from "@/core/shared/infrastructure/http/openapi";
import type { PermisoGuard } from "@/core/shared/infrastructure/http/permisoGuard";
import type { AuthMiddleware } from "@/modules/auth";
import type { AuditoriaController } from "../controllers/AuditoriaController";
import {
	auditoriaPaginaSchema,
	obtenerAuditoriaSchema,
} from "../schemas/auditoriaSchemas";

export class AuditoriaRouter {
	public readonly router = new OpenAPIHono();

	constructor(
		authMiddleware: AuthMiddleware,
		requierePermiso: PermisoGuard,
		controller: AuditoriaController,
	) {
		this.router.openAPIRegistry.registerPath({
			method: "get",
			path: "/",
			tags: ["Auditoría"],
			security: [{ bearerAuth: [] }],
			summary: "Listar el registro de auditoría (más reciente primero)",
			request: { query: obtenerAuditoriaSchema },
			responses: {
				200: jsonResponse(auditoriaPaginaSchema, "Registros paginados"),
				400: errorResponse("Parámetros inválidos"),
				...protectedErrorResponses("auditoria:leer"),
			},
		});
		this.router.get(
			"/",
			authMiddleware.handle,
			requierePermiso.handle("auditoria", "leer"),
			controller.ejecutar,
		);
	}
}
