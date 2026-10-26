import { OpenAPIHono } from "@hono/zod-openapi";

import { LoginController } from "../controllers/LoginController";
import { RegisterController } from "../controllers/RegisterController";
import { RefreshTokenController } from "../controllers/RefreshTokenController";
import { LogoutController } from "../controllers/LogoutController";
import { rateLimit } from "@/core/shared/infrastructure/http/rateLimit";
import {
	errorResponse,
	jsonResponse,
} from "@/core/shared/infrastructure/http/openapi";
import {
	authResponseSchema,
	loginSchema,
	messageResponseSchema,
	refreshResponseSchema,
	registerSchema,
} from "../schemas/authSchemas";

const MINUTE = 60 * 1000;

const tags = ["Auth"];
// Rutas públicas: no exigen el bearerAuth global del documento.
const security: [] = [];

export class AuthRouter {
	public readonly router: OpenAPIHono;

	constructor(
		private readonly loginController: LoginController,
		private readonly registerController: RegisterController,
		private readonly refreshTokenController: RefreshTokenController,
		private readonly logoutController: LogoutController,
	) {
		this.router = new OpenAPIHono();
		this.initRoutes();
	}

	private initRoutes() {
		// La documentación OpenAPI se genera desde los mismos schemas Zod que
		// validan los controladores.
		const docs = this.router.openAPIRegistry;

		// Freno a fuerza bruta y altas masivas: límites por IP.
		const loginLimit = rateLimit({ windowMs: 15 * MINUTE, limit: 5 });
		const registerLimit = rateLimit({ windowMs: 60 * MINUTE, limit: 4 });

		docs.registerPath({
			method: "post",
			path: "/login",
			tags,
			security,
			summary: "Iniciar sesión",
			description:
				"Devuelve el access token y fija el refresh token en la cookie httpOnly `refresh_token`.",
			request: {
				body: {
					required: true,
					content: { "application/json": { schema: loginSchema } },
				},
			},
			responses: {
				200: jsonResponse(authResponseSchema, "Login exitoso"),
				400: errorResponse("Datos inválidos"),
				401: errorResponse("Credenciales inválidas"),
				403: errorResponse("Usuario desactivado"),
				429: {
					description: "Demasiados intentos (máx. 5 por IP cada 15 minutos)",
				},
			},
		});
		this.router.post("/login", loginLimit, this.loginController.run);

		docs.registerPath({
			method: "post",
			path: "/register",
			tags,
			security,
			summary: "Registrar un nuevo usuario",
			request: {
				body: {
					required: true,
					content: { "application/json": { schema: registerSchema } },
				},
			},
			responses: {
				201: jsonResponse(
					authResponseSchema,
					"Usuario registrado exitosamente y sesión iniciada",
				),
				400: errorResponse("Validación fallida o correo ya registrado"),
				429: { description: "Demasiados registros (máx. 4 por IP cada hora)" },
			},
		});
		this.router.post("/register", registerLimit, this.registerController.run);

		docs.registerPath({
			method: "post",
			path: "/refresh",
			tags,
			security,
			summary: "Renovar tokens usando un refresh token válido",
			description:
				"Lee el refresh token de la cookie httpOnly `refresh_token`, lo revoca y emite un nuevo access token junto con una cookie nueva (Refresh Token Rotation).",
			responses: {
				200: jsonResponse(
					refreshResponseSchema,
					"Tokens renovados (cookie `refresh_token` renovada)",
				),
				400: errorResponse("Cookie `refresh_token` ausente"),
				401: errorResponse("Refresh token inválido o expirado"),
			},
		});
		this.router.post("/refresh", this.refreshTokenController.run);

		docs.registerPath({
			method: "post",
			path: "/logout",
			tags,
			security,
			summary: "Cerrar sesión (revocar refresh token)",
			description:
				"Revoca el refresh token de la cookie httpOnly `refresh_token` y la borra. El access token seguirá siendo válido hasta que expire (máx 15 min).",
			responses: {
				200: jsonResponse(
					messageResponseSchema,
					"Sesión cerrada correctamente",
				),
				400: errorResponse("Refresh token inválido"),
			},
		});
		this.router.post("/logout", this.logoutController.run);
	}
}
