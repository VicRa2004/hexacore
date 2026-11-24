import { OpenAPIHono, z } from "@hono/zod-openapi";
import {
	errorResponse,
	jsonResponse,
} from "@/core/shared/infrastructure/http/openapi";
import { rateLimit } from "@/core/shared/infrastructure/http/rateLimit";
import type { OAuthController } from "../controllers/OAuthController";
import type { AuthMiddleware } from "../middlewares/authMiddleware";
import {
	authResponseSchema,
	mensajeResponseSchema,
	requiere2faResponseSchema,
} from "../schemas/authSchemas";
import {
	callbackOAuthQuerySchema,
	canjearOAuthSchema,
	cuentaOAuthSchema,
	proveedoresOAuthSchema,
	proveedorParamSchema,
	urlAutorizacionSchema,
} from "../schemas/oauthSchemas";

const MINUTE = 60 * 1000;
const tags = ["Auth · OAuth"];
const security: [] = [];
const bearer = [{ bearerAuth: [] }];

/** Montado en `/api/auth/oauth` (la cookie de estado usa ese path). */
export class OAuthRouter {
	public readonly router = new OpenAPIHono();

	constructor(
		private readonly controller: OAuthController,
		private readonly authMiddleware: AuthMiddleware,
	) {
		this.iniciarRutas();
	}

	private iniciarRutas() {
		const docs = this.router.openAPIRegistry;
		const auth = this.authMiddleware.handle;
		const limiteInicio = rateLimit({ windowMs: 15 * MINUTE, limit: 20 });
		const limiteCanje = rateLimit({ windowMs: 15 * MINUTE, limit: 10 });

		docs.registerPath({
			method: "get",
			path: "/proveedores",
			tags,
			security,
			summary: "Proveedores de login social configurados",
			description:
				"Solo aparecen los que tienen `<PROVEEDOR>_CLIENT_ID` y `<PROVEEDOR>_CLIENT_SECRET`.",
			responses: {
				200: jsonResponse(proveedoresOAuthSchema, "Proveedores disponibles"),
			},
		});
		this.router.get("/proveedores", this.controller.disponibles);

		docs.registerPath({
			method: "post",
			path: "/{proveedor}/iniciar",
			tags,
			security,
			summary: "Empezar el login con un proveedor",
			description:
				"Fija la cookie firmada `oauth_estado` (state + verificador PKCE, 10 min) y devuelve la URL del proveedor a la que navegar.",
			request: { params: proveedorParamSchema },
			responses: {
				200: jsonResponse(urlAutorizacionSchema, "URL de autorización"),
				404: errorResponse("Proveedor no configurado"),
				429: errorResponse("Demasiados intentos"),
			},
		});
		this.router.post(
			"/:proveedor/iniciar",
			limiteInicio,
			this.controller.iniciar,
		);

		docs.registerPath({
			method: "post",
			path: "/{proveedor}/vincular",
			tags,
			security: bearer,
			summary: "Empezar a vincular un proveedor al usuario en sesión",
			request: { params: proveedorParamSchema },
			responses: {
				200: jsonResponse(urlAutorizacionSchema, "URL de autorización"),
				401: errorResponse("No autenticado"),
				404: errorResponse("Proveedor no configurado"),
			},
		});
		this.router.post("/:proveedor/vincular", auth, this.controller.vincular);

		docs.registerPath({
			method: "get",
			path: "/{proveedor}/callback",
			tags,
			security,
			summary: "Vuelta desde el proveedor",
			description:
				"La llama el navegador al volver del proveedor. Redirige a `${APP_URL}/oauth-callback#codigo=…` (canjear en `POST /canjear`), `#vinculada=<proveedor>` o `#error=<mensaje>`.",
			request: {
				params: proveedorParamSchema,
				query: callbackOAuthQuerySchema,
			},
			responses: { 302: { description: "Redirección a la web" } },
		});
		this.router.get(
			"/:proveedor/callback",
			limiteInicio,
			this.controller.callback,
		);

		docs.registerPath({
			method: "post",
			path: "/canjear",
			tags,
			security,
			summary: "Canjear el código de la vuelta OAuth por la sesión",
			description:
				"Igual que `POST /api/auth/login`: access token + cookie `refresh_token`, o `{ requiere2fa, token2fa }` si el usuario tiene 2FA.",
			request: {
				body: {
					required: true,
					content: { "application/json": { schema: canjearOAuthSchema } },
				},
			},
			responses: {
				200: jsonResponse(
					z.union([authResponseSchema, requiere2faResponseSchema]),
					"Sesión iniciada o pendiente del segundo factor",
				),
				400: errorResponse("Código inválido, caducado o ya usado"),
				403: errorResponse("Usuario desactivado"),
				429: errorResponse("Demasiados intentos o cuenta bloqueada"),
			},
		});
		this.router.post("/canjear", limiteCanje, this.controller.canjear);

		docs.registerPath({
			method: "get",
			path: "/cuentas",
			tags,
			security: bearer,
			summary: "Cuentas externas vinculadas al usuario en sesión",
			responses: {
				200: jsonResponse(z.array(cuentaOAuthSchema), "Cuentas vinculadas"),
				401: errorResponse("No autenticado"),
			},
		});
		this.router.get("/cuentas", auth, this.controller.cuentas);

		docs.registerPath({
			method: "delete",
			path: "/cuentas/{proveedor}",
			tags,
			security: bearer,
			summary: "Desvincular un proveedor",
			request: { params: proveedorParamSchema },
			responses: {
				200: jsonResponse(mensajeResponseSchema, "Cuenta desvinculada"),
				401: errorResponse("No autenticado"),
				404: errorResponse("No había una cuenta de ese proveedor vinculada"),
			},
		});
		this.router.delete(
			"/cuentas/:proveedor",
			auth,
			this.controller.desvincular,
		);
	}
}
