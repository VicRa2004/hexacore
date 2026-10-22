import type { Context, Next } from "hono";
import { injectable, inject } from "tsyringe";
import { AUTH_TOKENS } from "@/modules/auth/application/tokens";
import type {
	AccessTokenPayload,
	TokenService,
} from "../../../domain/service/TokenService";

/** Variables de contexto que publica este middleware para los siguientes handlers. */
export type AuthEnv = { Variables: { user: AccessTokenPayload } };

/**
 * Middleware de autenticación mediante JWT.
 * Intercepta la petición para validar la existencia y validez de un token Bearer.
 * Si el token es válido, inyecta los datos del usuario decodificados en el contexto de Hono.
 *
 * @example
 * app.use("/api/*", authMiddleware.handle);
 * app.get("/api/perfil", authMiddleware.handle, controller.run.bind(controller));
 */
@injectable()
export class AuthMiddleware {
	constructor(
		@inject(AUTH_TOKENS.TokenService)
		private readonly tokenService: TokenService,
	) {}

	/**
	 * Manejador del middleware para Hono.
	 * Verifica el header 'Authorization', extrae el token y lo valida.
	 *
	 * @param {Context} c - Contexto de la petición de Hono (contiene req, res y variables de estado).
	 * @param {Next} next - Función asíncrona para ceder el control al siguiente middleware o controlador.
	 * @returns {Promise<Response | undefined>} Retorna una respuesta HTTP 401 si falla, o cede el control con `await next()`.
	 */
	handle = async (
		c: Context<AuthEnv>,
		next: Next,
	): Promise<Response | undefined> => {
		// En Hono, los headers se obtienen a través de c.req.header()
		const authHeader = c.req.header("Authorization");

		if (!authHeader?.startsWith("Bearer ")) {
			return c.json(
				{
					success: false,
					error: "No se proporcionó un token de autenticación",
				},
				401,
			);
		}

		const token = authHeader.split(" ")[1];

		if (!token) {
			return c.json({ success: false, error: "Token inválido" }, 401);
		}

		// next() queda fuera del try: un error del controlador no es un token inválido.
		try {
			// En lugar de mutar req (ej. req.user), en Hono guardamos datos en el contexto
			// usando c.set() para que otros middlewares/controladores puedan leerlo con c.get()
			c.set("user", this.tokenService.verifyToken(token));
		} catch {
			return c.json(
				{ success: false, error: "Token inválido o expirado" },
				401,
			);
		}

		await next(); // Siempre debe llevar await en Hono
	};
}
