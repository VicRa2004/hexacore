import { OpenAPIHono } from "@hono/zod-openapi";
import {
	errorResponse,
	jsonResponse,
	protectedErrorResponses,
} from "@/core/shared/infrastructure/http/openapi";

import type { AuthMiddleware } from "@/modules/auth";
import type { PermisoGuard } from "@/core/shared/infrastructure/http/permisoGuard";

import { UsuarioController } from "../controllers/UsuarioController";
import {
	crearUsuarioSchema,
	obtenerUsuariosSchema,
	actualizarUsuarioSchema,
	usuarioDtoSchema,
	usuarioIdSchema,
	usuarioPaginaSchema,
} from "../schemas/usuarioSchemas";

const tags = ["Usuarios"];
const security = [{ bearerAuth: [] }];

export class UsuarioRouter {
	public readonly router: OpenAPIHono;

	constructor(
		private readonly authMiddleware: AuthMiddleware,
		private readonly requierePermisoMiddleware: PermisoGuard,
		private readonly controller: UsuarioController,
	) {
		this.router = new OpenAPIHono();
		this.iniciarRutas();
	}

	private iniciarRutas() {
		// La documentación OpenAPI se genera desde los mismos schemas Zod que
		// validan los controladores.
		const docs = this.router.openAPIRegistry;

		// Todas las rutas requieren token JWT válido
		this.router.use(this.authMiddleware.handle);

		// Cada ruta verifica dinámicamente en la BD si el usuario tiene
		// el permiso exacto para el recurso "usuarios" y la acción requerida.
		docs.registerPath({
			method: "post",
			path: "/",
			tags,
			security,
			summary: "Crear un nuevo usuario",
			request: {
				body: {
					required: true,
					content: { "application/json": { schema: crearUsuarioSchema } },
				},
			},
			responses: {
				201: jsonResponse(usuarioDtoSchema, "Usuario creado exitosamente"),
				400: errorResponse("Validación fallida o usuario existente"),
				...protectedErrorResponses("usuarios:crear"),
			},
		});
		this.router.post(
			"/",
			this.requierePermisoMiddleware.handle("usuarios", "crear"),
			this.controller.crear,
		);

		docs.registerPath({
			method: "get",
			path: "/",
			tags,
			security,
			summary: "Listar usuarios (paginado, filtro parcial por email)",
			request: { query: obtenerUsuariosSchema },
			responses: {
				200: jsonResponse(usuarioPaginaSchema, "Lista paginada de usuarios"),
				400: errorResponse("Parámetros inválidos"),
				...protectedErrorResponses("usuarios:leer"),
			},
		});
		this.router.get(
			"/",
			this.requierePermisoMiddleware.handle("usuarios", "leer"),
			this.controller.obtenerTodos,
		);

		docs.registerPath({
			method: "get",
			path: "/{id}",
			tags,
			security,
			summary: "Obtener un usuario por ID",
			request: { params: usuarioIdSchema },
			responses: {
				200: jsonResponse(usuarioDtoSchema, "Datos del usuario encontrado"),
				...protectedErrorResponses("usuarios:leer"),
				404: errorResponse("Usuario no encontrado"),
			},
		});
		this.router.get(
			"/:id",
			this.requierePermisoMiddleware.handle("usuarios", "leer"),
			this.controller.obtenerUno,
		);

		docs.registerPath({
			method: "put",
			path: "/{id}",
			tags,
			security,
			summary: "Actualizar un usuario",
			request: {
				params: usuarioIdSchema,
				body: {
					required: true,
					content: { "application/json": { schema: actualizarUsuarioSchema } },
				},
			},
			responses: {
				200: jsonResponse(usuarioDtoSchema, "Usuario actualizado"),
				400: errorResponse("Validación fallida"),
				...protectedErrorResponses("usuarios:actualizar"),
				404: errorResponse("Usuario no encontrado"),
			},
		});
		this.router.put(
			"/:id",
			this.requierePermisoMiddleware.handle("usuarios", "actualizar"),
			this.controller.actualizar,
		);

		docs.registerPath({
			method: "delete",
			path: "/{id}",
			tags,
			security,
			summary: "Eliminar un usuario",
			request: { params: usuarioIdSchema },
			responses: {
				204: { description: "Usuario eliminado correctamente" },
				...protectedErrorResponses("usuarios:eliminar"),
				404: errorResponse("Usuario no encontrado"),
			},
		});
		this.router.delete(
			"/:id",
			this.requierePermisoMiddleware.handle("usuarios", "eliminar"),
			this.controller.eliminar,
		);
	}
}
