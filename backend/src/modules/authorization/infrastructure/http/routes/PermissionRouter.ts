import { OpenAPIHono, z } from "@hono/zod-openapi";
import {
	errorResponse,
	jsonResponse,
	protectedErrorResponses,
} from "@/core/shared/infrastructure/http/openapi";

import type { AuthMiddleware } from "@/modules/auth";
import type { PermissionGuard } from "@/core/shared/infrastructure/http/permissionGuard";

import { PermissionController } from "../controllers/PermissionController";
import {
	createPermissionSchema,
	permissionDtoSchema,
	permissionIdSchema,
	updatePermissionSchema,
	userIdParamSchema,
} from "../schemas/permissionSchemas";

const tags = ["Permissions"];
const security = [{ bearerAuth: [] }];

export class PermissionRouter {
	public readonly router: OpenAPIHono;

	constructor(
		private readonly authMiddleware: AuthMiddleware,
		private readonly requirePermissionMiddleware: PermissionGuard,
		private readonly controller: PermissionController,
	) {
		this.router = new OpenAPIHono();
		this.initRoutes();
	}

	private initRoutes(): void {
		// La documentación OpenAPI se genera desde los mismos schemas Zod que
		// validan los controladores.
		const docs = this.router.openAPIRegistry;

		this.router.use(this.authMiddleware.handle);

		docs.registerPath({
			method: "get",
			path: "/users/{userId}",
			tags,
			security,
			summary: "Obtener los permisos efectivos de un usuario",
			request: { params: userIdParamSchema },
			responses: {
				200: jsonResponse(
					z.array(permissionDtoSchema),
					"Permisos efectivos del usuario (roles + excepciones directas)",
				),
				...protectedErrorResponses("permissions:read"),
			},
		});
		this.router.get(
			"/users/:userId",
			this.requirePermissionMiddleware.handle("permissions", "read"),
			this.controller.getByUser,
		);

		docs.registerPath({
			method: "get",
			path: "/",
			tags,
			security,
			summary: "Listar todos los permisos del sistema",
			responses: {
				200: jsonResponse(
					z.array(permissionDtoSchema),
					"Lista de permisos existentes",
				),
				...protectedErrorResponses("permissions:read"),
			},
		});
		this.router.get(
			"/",
			this.requirePermissionMiddleware.handle("permissions", "read"),
			this.controller.getAll,
		);

		docs.registerPath({
			method: "get",
			path: "/{id}",
			tags,
			security,
			summary: "Obtener un permiso por ID",
			request: { params: permissionIdSchema },
			responses: {
				200: jsonResponse(permissionDtoSchema, "Datos del permiso solicitado"),
				...protectedErrorResponses("permissions:read"),
				404: errorResponse("Permiso no encontrado"),
			},
		});
		this.router.get(
			"/:id",
			this.requirePermissionMiddleware.handle("permissions", "read"),
			this.controller.getOne,
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
					content: { "application/json": { schema: createPermissionSchema } },
				},
			},
			responses: {
				201: jsonResponse(permissionDtoSchema, "Permiso creado exitosamente"),
				400: errorResponse("Validación fallida o permiso duplicado"),
				...protectedErrorResponses("permissions:create"),
			},
		});
		this.router.post(
			"/",
			this.requirePermissionMiddleware.handle("permissions", "create"),
			this.controller.create,
		);

		docs.registerPath({
			method: "put",
			path: "/{id}",
			tags,
			security,
			summary: "Actualizar un permiso",
			request: {
				params: permissionIdSchema,
				body: {
					required: true,
					content: { "application/json": { schema: updatePermissionSchema } },
				},
			},
			responses: {
				200: jsonResponse(
					permissionDtoSchema,
					"Permiso actualizado exitosamente",
				),
				400: errorResponse("Validación fallida o conflicto"),
				...protectedErrorResponses("permissions:update"),
				404: errorResponse("Permiso no encontrado"),
			},
		});
		this.router.put(
			"/:id",
			this.requirePermissionMiddleware.handle("permissions", "update"),
			this.controller.update,
		);

		docs.registerPath({
			method: "delete",
			path: "/{id}",
			tags,
			security,
			summary: "Eliminar un permiso",
			request: { params: permissionIdSchema },
			responses: {
				204: { description: "Permiso eliminado correctamente" },
				...protectedErrorResponses("permissions:delete"),
				404: errorResponse("Permiso no encontrado"),
			},
		});
		this.router.delete(
			"/:id",
			this.requirePermissionMiddleware.handle("permissions", "delete"),
			this.controller.delete,
		);
	}
}
