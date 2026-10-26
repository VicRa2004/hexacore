import { OpenAPIHono } from "@hono/zod-openapi";
import {
	errorResponse,
	jsonResponse,
	protectedErrorResponses,
} from "@/core/shared/infrastructure/http/openapi";

import type { AuthMiddleware } from "@/modules/auth";
import type { PermissionGuard } from "@/core/shared/infrastructure/http/permissionGuard";

import { UserController } from "../controllers/UserController";
import {
	createUserSchema,
	getAllUsersSchema,
	updateUserSchema,
	userDtoSchema,
	userIdSchema,
	userPageSchema,
} from "../schemas/userSchemas";

const tags = ["Users"];
const security = [{ bearerAuth: [] }];

export class UserRouter {
	public readonly router: OpenAPIHono;

	constructor(
		private readonly authMiddleware: AuthMiddleware,
		private readonly requirePermissionMiddleware: PermissionGuard,
		private readonly controller: UserController,
	) {
		this.router = new OpenAPIHono();
		this.initRoutes();
	}

	private initRoutes() {
		// La documentación OpenAPI se genera desde los mismos schemas Zod que
		// validan los controladores.
		const docs = this.router.openAPIRegistry;

		// Todas las rutas requieren token JWT válido
		this.router.use(this.authMiddleware.handle);

		// Cada ruta verifica dinámicamente en la BD si el usuario tiene
		// el permiso exacto para el recurso "users" y la acción requerida.
		docs.registerPath({
			method: "post",
			path: "/",
			tags,
			security,
			summary: "Crear un nuevo usuario",
			request: {
				body: {
					required: true,
					content: { "application/json": { schema: createUserSchema } },
				},
			},
			responses: {
				201: jsonResponse(userDtoSchema, "Usuario creado exitosamente"),
				400: errorResponse("Validación fallida o usuario existente"),
				...protectedErrorResponses("users:create"),
			},
		});
		this.router.post(
			"/",
			this.requirePermissionMiddleware.handle("users", "create"),
			this.controller.create,
		);

		docs.registerPath({
			method: "get",
			path: "/",
			tags,
			security,
			summary: "Listar usuarios (paginado, filtro parcial por email)",
			request: { query: getAllUsersSchema },
			responses: {
				200: jsonResponse(userPageSchema, "Lista paginada de usuarios"),
				400: errorResponse("Parámetros inválidos"),
				...protectedErrorResponses("users:read"),
			},
		});
		this.router.get(
			"/",
			this.requirePermissionMiddleware.handle("users", "read"),
			this.controller.getAll,
		);

		docs.registerPath({
			method: "get",
			path: "/{id}",
			tags,
			security,
			summary: "Obtener un usuario por ID",
			request: { params: userIdSchema },
			responses: {
				200: jsonResponse(userDtoSchema, "Datos del usuario encontrado"),
				...protectedErrorResponses("users:read"),
				404: errorResponse("Usuario no encontrado"),
			},
		});
		this.router.get(
			"/:id",
			this.requirePermissionMiddleware.handle("users", "read"),
			this.controller.getOne,
		);

		docs.registerPath({
			method: "put",
			path: "/{id}",
			tags,
			security,
			summary: "Actualizar un usuario",
			request: {
				params: userIdSchema,
				body: {
					required: true,
					content: { "application/json": { schema: updateUserSchema } },
				},
			},
			responses: {
				200: jsonResponse(userDtoSchema, "Usuario actualizado"),
				400: errorResponse("Validación fallida"),
				...protectedErrorResponses("users:update"),
				404: errorResponse("Usuario no encontrado"),
			},
		});
		this.router.put(
			"/:id",
			this.requirePermissionMiddleware.handle("users", "update"),
			this.controller.update,
		);

		docs.registerPath({
			method: "delete",
			path: "/{id}",
			tags,
			security,
			summary: "Eliminar un usuario",
			request: { params: userIdSchema },
			responses: {
				204: { description: "Usuario eliminado correctamente" },
				...protectedErrorResponses("users:delete"),
				404: errorResponse("Usuario no encontrado"),
			},
		});
		this.router.delete(
			"/:id",
			this.requirePermissionMiddleware.handle("users", "delete"),
			this.controller.delete,
		);
	}
}
