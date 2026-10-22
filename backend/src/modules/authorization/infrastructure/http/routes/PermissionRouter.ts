import { OpenAPIHono, z } from "@hono/zod-openapi";
import { injectable, inject } from "tsyringe";
import { TOKENS } from "@/core/shared/application/tokens";
import {
	errorResponse,
	jsonResponse,
	protectedErrorResponses,
} from "@/core/shared/infrastructure/http/openapi";

import type { AuthMiddleware } from "@/modules/auth";
import type { RequirePermissionMiddleware } from "@/modules/authorization/infrastructure/http/middlewares/RequirePermissionMiddleware";

// Controladores CRUD de permisos
import { GetAllPermissionsController } from "../controllers/GetAllPermissionsController";
import { GetPermissionController } from "../controllers/GetPermissionController";
import { CreatePermissionController } from "../controllers/CreatePermissionController";
import { UpdatePermissionController } from "../controllers/UpdatePermissionController";
import { DeletePermissionController } from "../controllers/DeletePermissionController";
import { GetUserPermissionsController } from "../controllers/GetUserPermissionsController";
import {
	createPermissionSchema,
	permissionDtoSchema,
	permissionIdSchema,
	updatePermissionSchema,
	userIdParamSchema,
} from "../schemas/permissionSchemas";

const tags = ["Permissions"];
const security = [{ bearerAuth: [] }];

@injectable()
export class PermissionRouter {
	public readonly router: OpenAPIHono;

	constructor(
		@inject(TOKENS.AuthMiddleware)
		private readonly authMiddleware: AuthMiddleware,
		@inject(TOKENS.RequirePermissionMiddleware)
		private readonly requirePermissionMiddleware: RequirePermissionMiddleware,
		private readonly getAllPermissionsController: GetAllPermissionsController,
		private readonly getPermissionController: GetPermissionController,
		private readonly createPermissionController: CreatePermissionController,
		private readonly updatePermissionController: UpdatePermissionController,
		private readonly deletePermissionController: DeletePermissionController,
		private readonly getUserPermissionsController: GetUserPermissionsController,
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
			this.getUserPermissionsController.run,
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
			this.getAllPermissionsController.run,
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
			this.getPermissionController.run,
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
			this.createPermissionController.run,
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
			this.updatePermissionController.run,
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
			this.deletePermissionController.run,
		);
	}
}
