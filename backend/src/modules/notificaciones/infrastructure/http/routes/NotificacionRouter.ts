import { OpenAPIHono } from "@hono/zod-openapi";
import {
	errorResponse,
	jsonResponse,
} from "@/core/shared/infrastructure/http/openapi";
import type { AuthMiddleware } from "@/modules/auth";
import type { NotificacionController } from "../controllers/NotificacionController";
import {
	listarNotificacionesSchema,
	marcarTodasLeidasRespuestaSchema,
	notificacionIdParamSchema,
	notificacionSchema,
	notificacionesPaginaSchema,
} from "../schemas/notificacionSchemas";

export class NotificacionRouter {
	public readonly router = new OpenAPIHono();

	constructor(
		authMiddleware: AuthMiddleware,
		controller: NotificacionController,
	) {
		this.router.openAPIRegistry.registerPath({
			method: "get",
			path: "/",
			tags: ["Notificaciones"],
			security: [{ bearerAuth: [] }],
			summary: "Listar notificaciones del usuario autenticado",
			request: { query: listarNotificacionesSchema },
			responses: {
				200: jsonResponse(
					notificacionesPaginaSchema,
					"Notificaciones paginadas y contador de no leídas",
				),
				400: errorResponse("Parámetros inválidos"),
				401: errorResponse("No autenticado"),
			},
		});
		this.router.get("/", authMiddleware.handle, controller.listar);

		this.router.openAPIRegistry.registerPath({
			method: "patch",
			path: "/leer-todas",
			tags: ["Notificaciones"],
			security: [{ bearerAuth: [] }],
			summary: "Marcar todas las notificaciones pendientes como leídas",
			responses: {
				200: jsonResponse(
					marcarTodasLeidasRespuestaSchema,
					"Cantidad de notificaciones actualizadas",
				),
				401: errorResponse("No autenticado"),
			},
		});
		this.router.patch(
			"/leer-todas",
			authMiddleware.handle,
			controller.marcarTodasLeidas,
		);

		this.router.openAPIRegistry.registerPath({
			method: "patch",
			path: "/{id}/leer",
			tags: ["Notificaciones"],
			security: [{ bearerAuth: [] }],
			summary: "Marcar una notificación como leída",
			request: { params: notificacionIdParamSchema },
			responses: {
				200: jsonResponse(
					notificacionSchema,
					"Notificación marcada como leída",
				),
				400: errorResponse("Id inválido"),
				401: errorResponse("No autenticado"),
				404: errorResponse("Notificación no encontrada"),
			},
		});
		this.router.patch(
			"/:id/leer",
			authMiddleware.handle,
			controller.marcarLeida,
		);
	}
}
