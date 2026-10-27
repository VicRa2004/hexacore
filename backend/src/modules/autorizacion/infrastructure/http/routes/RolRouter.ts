import { OpenAPIHono, z } from "@hono/zod-openapi";
import {
	errorResponse,
	jsonResponse,
	protectedErrorResponses,
} from "@/core/shared/infrastructure/http/openapi";

import type { AuthMiddleware } from "@/modules/auth";
import type { PermisoGuard } from "@/core/shared/infrastructure/http/permisoGuard";

import type { RolController } from "../controllers/RolController";
import {
	guardarRolSchema,
	rolDtoSchema,
	rolIdSchema,
} from "../schemas/rolSchemas";

const tags = ["Roles"];
const security = [{ bearerAuth: [] }];

const cuerpoRol = {
	required: true,
	content: { "application/json": { schema: guardarRolSchema } },
};

export class RolRouter {
	public readonly router: OpenAPIHono;

	constructor(
		private readonly authMiddleware: AuthMiddleware,
		private readonly requierePermisoMiddleware: PermisoGuard,
		private readonly controller: RolController,
	) {
		this.router = new OpenAPIHono();
		this.iniciarRutas();
	}

	private iniciarRutas(): void {
		const docs = this.router.openAPIRegistry;

		this.router.use(this.authMiddleware.handle);

		docs.registerPath({
			method: "get",
			path: "/",
			tags,
			security,
			summary: "Listar los roles con sus permisos",
			responses: {
				200: jsonResponse(z.array(rolDtoSchema), "Lista de roles"),
				...protectedErrorResponses("roles:leer"),
			},
		});
		this.router.get(
			"/",
			this.requierePermisoMiddleware.handle("roles", "leer"),
			this.controller.obtenerTodos,
		);

		docs.registerPath({
			method: "get",
			path: "/{id}",
			tags,
			security,
			summary: "Obtener un rol por ID",
			request: { params: rolIdSchema },
			responses: {
				200: jsonResponse(rolDtoSchema, "Datos del rol solicitado"),
				...protectedErrorResponses("roles:leer"),
				404: errorResponse("Rol no encontrado"),
			},
		});
		this.router.get(
			"/:id",
			this.requierePermisoMiddleware.handle("roles", "leer"),
			this.controller.obtenerUno,
		);

		docs.registerPath({
			method: "post",
			path: "/",
			tags,
			security,
			summary: "Crear un rol con sus permisos",
			request: { body: cuerpoRol },
			responses: {
				201: jsonResponse(rolDtoSchema, "Rol creado exitosamente"),
				400: errorResponse("Validación fallida"),
				...protectedErrorResponses("roles:crear"),
				404: errorResponse("Algún permiso no existe"),
				409: errorResponse("Ya existe un rol con ese nombre"),
			},
		});
		this.router.post(
			"/",
			this.requierePermisoMiddleware.handle("roles", "crear"),
			this.controller.crear,
		);

		docs.registerPath({
			method: "put",
			path: "/{id}",
			tags,
			security,
			summary: "Reemplazar nombre, descripción y permisos de un rol",
			request: { params: rolIdSchema, body: cuerpoRol },
			responses: {
				200: jsonResponse(rolDtoSchema, "Rol actualizado exitosamente"),
				400: errorResponse("Validación fallida"),
				...protectedErrorResponses("roles:actualizar"),
				404: errorResponse("Rol o permiso no encontrado"),
				409: errorResponse("Ya existe un rol con ese nombre"),
			},
		});
		this.router.put(
			"/:id",
			this.requierePermisoMiddleware.handle("roles", "actualizar"),
			this.controller.actualizar,
		);

		docs.registerPath({
			method: "delete",
			path: "/{id}",
			tags,
			security,
			summary: "Eliminar un rol sin usuarios asignados",
			request: { params: rolIdSchema },
			responses: {
				204: { description: "Rol eliminado correctamente" },
				...protectedErrorResponses("roles:eliminar"),
				404: errorResponse("Rol no encontrado"),
				409: errorResponse("El rol tiene usuarios asignados"),
			},
		});
		this.router.delete(
			"/:id",
			this.requierePermisoMiddleware.handle("roles", "eliminar"),
			this.controller.eliminar,
		);
	}
}
