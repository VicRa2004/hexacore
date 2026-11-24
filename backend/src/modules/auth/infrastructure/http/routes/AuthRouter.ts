import { OpenAPIHono, z } from "@hono/zod-openapi";

import type { DosFactoresController } from "../controllers/DosFactoresController";
import { LoginController } from "../controllers/LoginController";
import { RegistroController } from "../controllers/RegistroController";
import { RefreshTokenController } from "../controllers/RefreshTokenController";
import { LogoutController } from "../controllers/LogoutController";
import type { CuentaController } from "../controllers/CuentaController";
import type { SesionController } from "../controllers/SesionController";
import type { AuthMiddleware } from "../middlewares/authMiddleware";
import { rateLimit } from "@/core/shared/infrastructure/http/rateLimit";
import {
	errorResponse,
	jsonResponse,
} from "@/core/shared/infrastructure/http/openapi";
import {
	altaDosFactoresSchema,
	authResponseSchema,
	codigoSchema,
	codigosRecuperacionSchema,
	desactivarDosFactoresSchema,
	estadoDosFactoresSchema,
	loginDosFactoresSchema,
	requiere2faResponseSchema,
	cambiarPasswordSchema,
	loginSchema,
	mensajeResponseSchema,
	recuperarPasswordSchema,
	refreshResponseSchema,
	registroSchema,
	restablecerPasswordSchema,
	sesionIdSchema,
	sesionSchema,
	verificarEmailSchema,
} from "../schemas/authSchemas";

const MINUTE = 60 * 1000;

const tags = ["Auth"];
// Rutas públicas: no exigen el bearerAuth global del documento.
const security: [] = [];
const bearer = [{ bearerAuth: [] }];

const cuerpo = (schema: Parameters<typeof jsonResponse>[0]) => ({
	required: true,
	content: { "application/json": { schema } },
});

export class AuthRouter {
	public readonly router: OpenAPIHono;

	constructor(
		private readonly loginController: LoginController,
		private readonly registroController: RegistroController,
		private readonly refreshTokenController: RefreshTokenController,
		private readonly logoutController: LogoutController,
		private readonly cuentaController: CuentaController,
		private readonly sesionController: SesionController,
		private readonly dosFactoresController: DosFactoresController,
		private readonly authMiddleware: AuthMiddleware,
	) {
		this.router = new OpenAPIHono();
		this.iniciarRutas();
	}

	private iniciarRutas() {
		// La documentación OpenAPI se genera desde los mismos schemas Zod que
		// validan los controladores.
		const docs = this.router.openAPIRegistry;

		// Freno a fuerza bruta y altas masivas: límites por IP.
		const limiteLogin = rateLimit({ windowMs: 15 * MINUTE, limit: 5 });
		const limiteRegistro = rateLimit({ windowMs: 60 * MINUTE, limit: 4 });
		// Envío de correos: evita usar la API como cañón de spam.
		const limiteCorreos = rateLimit({ windowMs: 60 * MINUTE, limit: 5 });
		const limiteTokens = rateLimit({ windowMs: 15 * MINUTE, limit: 10 });

		docs.registerPath({
			method: "post",
			path: "/login",
			tags,
			security,
			summary: "Iniciar sesión",
			description:
				"Devuelve el access token y fija el refresh token en la cookie httpOnly `refresh_token`. Si el usuario tiene la verificación en dos pasos activa, devuelve `{ requiere2fa, token2fa }` sin sesión: se completa en `POST /login/2fa`.",
			request: {
				body: {
					required: true,
					content: { "application/json": { schema: loginSchema } },
				},
			},
			responses: {
				200: jsonResponse(
					z.union([authResponseSchema, requiere2faResponseSchema]),
					"Login exitoso o pendiente del segundo factor",
				),
				400: errorResponse("Datos inválidos"),
				401: errorResponse("Credenciales inválidas"),
				403: errorResponse("Usuario desactivado"),
				429: {
					description: "Demasiados intentos (máx. 5 por IP cada 15 minutos)",
				},
			},
		});
		this.router.post("/login", limiteLogin, this.loginController.login);

		// Límite propio por IP; además, el bloqueo por cuenta (5 fallos → 15 min).
		const limiteDosFactores = rateLimit({ windowMs: 15 * MINUTE, limit: 10 });
		docs.registerPath({
			method: "post",
			path: "/login/2fa",
			tags,
			security,
			summary: "Completar el login con el código de verificación en dos pasos",
			description:
				"Canjea el `token2fa` del primer paso y un código TOTP (o de recuperación, que se consume) por la sesión.",
			request: { body: cuerpo(loginDosFactoresSchema) },
			responses: {
				200: jsonResponse(authResponseSchema, "Login exitoso"),
				400: errorResponse("Datos inválidos"),
				401: errorResponse("Código incorrecto o token caducado"),
				403: errorResponse("Usuario desactivado"),
				429: errorResponse("Demasiados intentos o cuenta bloqueada"),
			},
		});
		this.router.post(
			"/login/2fa",
			limiteDosFactores,
			this.loginController.dosFactores,
		);

		docs.registerPath({
			method: "post",
			path: "/registro",
			tags,
			security,
			summary: "Registrar un nuevo usuario",
			request: {
				body: {
					required: true,
					content: { "application/json": { schema: registroSchema } },
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
		this.router.post(
			"/registro",
			limiteRegistro,
			this.registroController.ejecutar,
		);

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
		this.router.post("/refresh", this.refreshTokenController.ejecutar);

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
					mensajeResponseSchema,
					"Sesión cerrada correctamente",
				),
				400: errorResponse("Refresh token inválido"),
			},
		});
		this.router.post("/logout", this.logoutController.ejecutar);

		this.iniciarRutasCuenta(limiteCorreos, limiteTokens);
		this.iniciarRutasDosFactores();
	}

	private iniciarRutasDosFactores() {
		// Por IP, aparte del bloqueo por cuenta que aplica el verificador.
		const limiteTokens = rateLimit({ windowMs: 15 * MINUTE, limit: 10 });
		const docs = this.router.openAPIRegistry;
		const auth = this.authMiddleware.handle;
		const dosFactores = this.dosFactoresController;
		const tags = ["Auth · 2FA"];

		docs.registerPath({
			method: "get",
			path: "/2fa",
			tags,
			security: bearer,
			summary: "Estado de la verificación en dos pasos",
			responses: {
				200: jsonResponse(estadoDosFactoresSchema, "Estado del 2FA"),
				401: errorResponse("No autenticado"),
			},
		});
		this.router.get("/2fa", auth, dosFactores.obtener);

		docs.registerPath({
			method: "post",
			path: "/2fa/alta",
			tags,
			security: bearer,
			summary: "Generar el secreto TOTP (paso 1 del alta)",
			description:
				"Devuelve el secreto y la URI `otpauth://` para el QR. No activa nada hasta confirmar un código en `/2fa/activar`.",
			responses: {
				200: jsonResponse(altaDosFactoresSchema, "Secreto generado"),
				400: errorResponse("El 2FA ya está activado"),
				401: errorResponse("No autenticado"),
			},
		});
		this.router.post("/2fa/alta", auth, dosFactores.iniciar);

		docs.registerPath({
			method: "post",
			path: "/2fa/activar",
			tags,
			security: bearer,
			summary: "Confirmar el primer código y activar el 2FA (paso 2 del alta)",
			description:
				"Devuelve los códigos de recuperación: solo se muestran esta vez.",
			request: { body: cuerpo(codigoSchema) },
			responses: {
				200: jsonResponse(codigosRecuperacionSchema, "2FA activado"),
				400: errorResponse("Código incorrecto, sin alta iniciada o ya activo"),
				401: errorResponse("No autenticado"),
				429: { description: "Demasiados intentos" },
			},
		});
		this.router.post("/2fa/activar", auth, limiteTokens, dosFactores.activar);

		docs.registerPath({
			method: "post",
			path: "/2fa/desactivar",
			tags,
			security: bearer,
			summary: "Desactivar el 2FA (pide contraseña y código)",
			request: { body: cuerpo(desactivarDosFactoresSchema) },
			responses: {
				200: jsonResponse(mensajeResponseSchema, "2FA desactivado"),
				400: errorResponse("Contraseña o código incorrectos"),
				401: errorResponse("No autenticado"),
				429: errorResponse("Demasiados intentos o cuenta bloqueada"),
			},
		});
		this.router.post(
			"/2fa/desactivar",
			auth,
			limiteTokens,
			dosFactores.desactivar,
		);

		docs.registerPath({
			method: "post",
			path: "/2fa/codigos-recuperacion",
			tags,
			security: bearer,
			summary: "Regenerar los códigos de recuperación",
			description:
				"Invalida los anteriores. Los nuevos solo se muestran en esta respuesta.",
			request: { body: cuerpo(codigoSchema) },
			responses: {
				200: jsonResponse(codigosRecuperacionSchema, "Códigos nuevos"),
				400: errorResponse("Código incorrecto o 2FA no activo"),
				401: errorResponse("No autenticado"),
				429: errorResponse("Demasiados intentos o cuenta bloqueada"),
			},
		});
		this.router.post(
			"/2fa/codigos-recuperacion",
			auth,
			limiteTokens,
			dosFactores.regenerarCodigos,
		);
	}

	private iniciarRutasCuenta(
		limiteCorreos: ReturnType<typeof rateLimit>,
		limiteTokens: ReturnType<typeof rateLimit>,
	) {
		const docs = this.router.openAPIRegistry;
		const auth = this.authMiddleware.handle;
		const cuenta = this.cuentaController;

		docs.registerPath({
			method: "post",
			path: "/recuperar-password",
			tags,
			security,
			summary: "Enviar el enlace para restablecer la contraseña",
			description:
				"Responde igual exista o no el email, para no revelar qué cuentas existen.",
			request: { body: cuerpo(recuperarPasswordSchema) },
			responses: {
				200: jsonResponse(mensajeResponseSchema, "Solicitud recibida"),
				400: errorResponse("Email inválido"),
				429: {
					description: "Demasiadas solicitudes (máx. 5 por IP cada hora)",
				},
			},
		});
		this.router.post(
			"/recuperar-password",
			limiteCorreos,
			cuenta.solicitarRecuperacion,
		);

		docs.registerPath({
			method: "post",
			path: "/restablecer-password",
			tags,
			security,
			summary: "Restablecer la contraseña con el token del correo",
			description:
				"Cierra todas las sesiones del usuario y desbloquea la cuenta. El token es de un solo uso.",
			request: { body: cuerpo(restablecerPasswordSchema) },
			responses: {
				200: jsonResponse(mensajeResponseSchema, "Contraseña restablecida"),
				400: errorResponse("Validación fallida o enlace inválido/caducado"),
				429: { description: "Demasiados intentos" },
			},
		});
		this.router.post(
			"/restablecer-password",
			limiteTokens,
			cuenta.restablecerPassword,
		);

		docs.registerPath({
			method: "post",
			path: "/verificar-email",
			tags,
			security,
			summary: "Verificar el email con el token del correo",
			request: { body: cuerpo(verificarEmailSchema) },
			responses: {
				200: jsonResponse(mensajeResponseSchema, "Email verificado"),
				400: errorResponse("Enlace inválido o caducado"),
				429: { description: "Demasiados intentos" },
			},
		});
		this.router.post("/verificar-email", limiteTokens, cuenta.verificarEmail);

		docs.registerPath({
			method: "post",
			path: "/verificar-email/reenviar",
			tags,
			security: bearer,
			summary: "Reenviar el correo de verificación al usuario autenticado",
			responses: {
				200: jsonResponse(mensajeResponseSchema, "Correo enviado"),
				400: errorResponse("El email ya está verificado"),
				401: errorResponse("No autenticado"),
				429: { description: "Demasiadas solicitudes" },
			},
		});
		this.router.post(
			"/verificar-email/reenviar",
			auth,
			limiteCorreos,
			cuenta.reenviarVerificacion,
		);

		docs.registerPath({
			method: "put",
			path: "/password",
			tags,
			security: bearer,
			summary: "Cambiar la propia contraseña",
			description:
				"Cierra el resto de sesiones: revoca todos los refresh tokens y devuelve una sesión nueva (cookie `refresh_token` renovada).",
			request: { body: cuerpo(cambiarPasswordSchema) },
			responses: {
				200: jsonResponse(refreshResponseSchema, "Contraseña cambiada"),
				400: errorResponse("Validación fallida o contraseña actual incorrecta"),
				401: errorResponse("No autenticado"),
			},
		});
		this.router.put("/password", auth, cuenta.cambiarPassword);

		docs.registerPath({
			method: "post",
			path: "/logout-todas",
			tags,
			security: bearer,
			summary: "Cerrar todas las sesiones (todos los dispositivos)",
			description:
				"Revoca todos los refresh tokens del usuario. Los access tokens emitidos siguen valiendo hasta que caducan (máx. 15 min).",
			responses: {
				200: jsonResponse(mensajeResponseSchema, "Sesiones cerradas"),
				401: errorResponse("No autenticado"),
			},
		});
		this.router.post("/logout-todas", auth, cuenta.cerrarSesiones);

		// Bajo /api/auth para recibir la cookie `refresh_token` y marcar la sesión actual.
		docs.registerPath({
			method: "get",
			path: "/sesiones",
			tags,
			security: bearer,
			summary: "Listar las sesiones abiertas (una por dispositivo)",
			responses: {
				200: jsonResponse(sesionSchema.array(), "Sesiones abiertas"),
				401: errorResponse("No autenticado"),
			},
		});
		this.router.get("/sesiones", auth, this.sesionController.listar);

		docs.registerPath({
			method: "delete",
			path: "/sesiones/{id}",
			tags,
			security: bearer,
			summary: "Cerrar una sesión concreta",
			description:
				"Revoca su refresh token. Su access token sigue valiendo hasta que caduca (máx. 15 min).",
			request: { params: sesionIdSchema },
			responses: {
				200: jsonResponse(mensajeResponseSchema, "Sesión cerrada"),
				401: errorResponse("No autenticado"),
				404: errorResponse(
					"La sesión no existe, no es tuya o ya estaba cerrada",
				),
			},
		});
		this.router.delete("/sesiones/:id", auth, this.sesionController.cerrar);
	}
}
