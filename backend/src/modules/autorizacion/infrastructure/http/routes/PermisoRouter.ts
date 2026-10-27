import { OpenAPIHono, z } from "@hono/zod-openapi";
import {
	errorResponse,
	jsonResponse,
	protectedErrorResponses,
} from "@/core/shared/infrastructure/http/openapi";

import type { AuthMiddleware } from "@/modules/auth";
import type { PermisoGuard } from "@/core/shared/infrastructure/http/permisoGuard";

import { PermisoController } from "../controllers/PermisoController";
import {
	crearPermisoSchema,
	permisoDtoSchema,
	permisoIdSchema,
	actualizarPermisoSchema,
	usuarioIdParamSchema,
} from "../schemas/permisoSchemas";

const tags = ["Permissions"];
const security = [{ bearerAuth: [] }];

export class PermisoRouter {
	public readonly router: OpenAPIHono;

	constructor(
		private readonly authMiddleware: AuthMiddleware,
		private readonly requierePermisoMiddleware: PermisoGuard,
		private readonly controller: PermisoController,
	) {
		this.router = new OpenAPIHono();
		this.iniciarRutas();
	}

	private iniciarRutas(): void {
		// La documentación OpenAPI se genera desde los mismos schemas Zod que
		// validan los controladores.
		const docs = this.router.openAPIRegistry;

		this.router.use(this.authMiddleware.handle);

		docs.registerPath({
			method: "get",
			path: "/usuarios/{usuarioId}",
			tags,
			security,
			summary: "Obtener los permisos efectivos de un usuario",
			request: { params: usuarioIdParamSchema },
			responses: {
				200: jsonResponse(
					z.array(permisoDtoSchema),
					"Permisos efectivos del usuario (roles + excepciones directas)",
				),
				...protectedErrorResponses("permisos:leer"),
			},
		});
		this.router.get(
			"/usuarios/:usuarioId",
			this.requierePermisoMiddleware.handle("permisos", "leer"),
			this.controller.obtenerPorUsuario,
		);

		docs.registerPath({
			method: "get",
			path: "/",
			tags,
			security,
			summary: "Listar todos los permisos del sistema",
			responses: {
				200: jsonResponse(
					z.array(permisoDtoSchema),
					"Lista de permisos existentes",
				),
				...protectedErrorResponses("permisos:leer"),
			},
		});
		this.router.get(
			"/",
			this.requierePermisoMiddleware.handle("permisos", "leer"),
			this.controller.obtenerTodos,
		);

		docs.registerPath({
			method: "get",
			path: "/{id}",
			tags,
			security,
			summary: "Obtener un permiso por ID",
			request: { params: permisoIdSchema },
			responses: {
				200: jsonResponse(permisoDtoSchema, "Datos del permiso solicitado"),
				...protectedErrorResponses("permisos:leer"),
				404: errorResponse("Permiso no encontrado"),
			},
		});
		this.router.get(
			"/:id",
			this.requierePermisoMiddleware.handle("permisos", "leer"),
			this.controller.obtenerUno,
		);

		docs.registerPath({
			method: "post",
			path: "/",
			tags,
			security,
			summary: "Crear un nuevo permiso",
			request: {
				body: {
					required: true,
					content: { "application/json": { schema: crearPermisoSchema } },
				},
			},
			responses: {
				201: jsonResponse(permisoDtoSchema, "Permiso creado exitosamente"),
				400: errorResponse("Validación fallida o permiso duplicado"),
				...protectedErrorResponses("permisos:crear"),
			},
		});
		this.router.post(
			"/",
			this.requierePermisoMiddleware.handle("permisos", "crear"),
			this.controller.crear,
		);

		docs.registerPath({
			method: "put",
			path: "/{id}",
			tags,
			security,
			summary: "Actualizar un permiso",
			request: {
				params: permisoIdSchema,
				body: {
					required: true,
					content: { "application/json": { schema: actualizarPermisoSchema } },
				},
			},
			responses: {
				200: jsonResponse(permisoDtoSchema, "Permiso actualizado exitosamente"),
				400: errorResponse("Validación fallida o conflicto"),
				...protectedErrorResponses("permisos:actualizar"),
				404: errorResponse("Permiso no encontrado"),
			},
		});
		this.router.put(
			"/:id",
			this.requierePermisoMiddleware.handle("permisos", "actualizar"),
			this.controller.actualizar,
		);

		docs.registerPath({
			method: "delete",
			path: "/{id}",
			tags,
			security,
			summary: "Eliminar un permiso",
			request: { params: permisoIdSchema },
			responses: {
				204: { description: "Permiso eliminado correctamente" },
				...protectedErrorResponses("permisos:eliminar"),
				404: errorResponse("Permiso no encontrado"),
			},
		});
		this.router.delete(
			"/:id",
			this.requierePermisoMiddleware.handle("permisos", "eliminar"),
			this.controller.eliminar,
		);
	}
}
