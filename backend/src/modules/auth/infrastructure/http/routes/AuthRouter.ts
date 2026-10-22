import { Hono } from "hono";
import { injectable } from "tsyringe";

import { LoginController } from "../controllers/LoginController";
import { RegisterController } from "../controllers/RegisterController";
import { RefreshTokenController } from "../controllers/RefreshTokenController";
import { LogoutController } from "../controllers/LogoutController";
import { rateLimit } from "@/core/shared/infrastructure/http/rateLimit";

const MINUTE = 60 * 1000;

@injectable()
export class AuthRouter {
	public readonly router: Hono;

	constructor(
		private readonly loginController: LoginController,
		private readonly registerController: RegisterController,
		private readonly refreshTokenController: RefreshTokenController,
		private readonly logoutController: LogoutController,
	) {
		this.router = new Hono();
		this.initRoutes();
	}

	private initRoutes() {
		// Freno a fuerza bruta y altas masivas: límites por IP.
		const loginLimit = rateLimit({ windowMs: 15 * MINUTE, limit: 5 });
		const registerLimit = rateLimit({ windowMs: 60 * MINUTE, limit: 4 });

		/**
		 * @openapi
		 * /api/auth/login:
		 *   post:
		 *     tags: [Auth]
		 *     summary: Iniciar sesión
		 *     requestBody:
		 *       required: true
		 *       content:
		 *         application/json:
		 *           schema:
		 *             type: object
		 *             required: [email, password]
		 *             properties:
		 *               email:
		 *                 type: string
		 *                 format: email
		 *                 example: user@example.com
		 *               password:
		 *                 type: string
		 *                 format: password
		 *                 example: SecurePass123!
		 *     responses:
		 *       200:
		 *         description: Login exitoso, retorna par de tokens y datos del usuario
		 *         content:
		 *           application/json:
		 *             schema:
		 *               $ref: '#/components/schemas/AuthResponse'
		 *       400:
		 *         description: Datos inválidos
		 *         content:
		 *           application/json:
		 *             schema:
		 *               $ref: '#/components/schemas/ErrorResponse'
		 *       401:
		 *         description: Credenciales inválidas
		 *         content:
		 *           application/json:
		 *             schema:
		 *               $ref: '#/components/schemas/ErrorResponse'
		 *       429:
		 *         description: Demasiados intentos (máx. 5 por IP cada 15 minutos)
		 */
		this.router.post("/login", loginLimit, this.loginController.run);

		/**
		 * @openapi
		 * /api/auth/register:
		 *   post:
		 *     tags: [Auth]
		 *     summary: Registrar un nuevo usuario
		 *     requestBody:
		 *       required: true
		 *       content:
		 *         application/json:
		 *           schema:
		 *             type: object
		 *             required: [name, email, password]
		 *             properties:
		 *               name:
		 *                 type: string
		 *                 example: John Doe
		 *               email:
		 *                 type: string
		 *                 format: email
		 *                 example: user@example.com
		 *               password:
		 *                 type: string
		 *                 format: password
		 *                 description: Mínimo 12 caracteres, al menos 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial
		 *                 example: SecurePass123!
		 *     responses:
		 *       201:
		 *         description: Usuario registrado exitosamente y sesión iniciada
		 *         content:
		 *           application/json:
		 *             schema:
		 *               $ref: '#/components/schemas/AuthResponse'
		 *       400:
		 *         description: Validación fallida o correo ya registrado
		 *         content:
		 *           application/json:
		 *             schema:
		 *               $ref: '#/components/schemas/ErrorResponse'
		 *       429:
		 *         description: Demasiados registros (máx. 4 por IP cada hora)
		 */
		this.router.post("/register", registerLimit, this.registerController.run);

		/**
		 * @openapi
		 * /api/auth/refresh:
		 *   post:
		 *     tags: [Auth]
		 *     summary: Renovar tokens usando un refresh token válido
		 *     description: >
		 *       Lee el refresh token de la cookie httpOnly `refresh_token`, lo revoca
		 *       y emite un nuevo access token junto con una cookie nueva
		 *       (Refresh Token Rotation).
		 *     responses:
		 *       200:
		 *         description: Tokens renovados exitosamente (cookie `refresh_token` renovada)
		 *         content:
		 *           application/json:
		 *             schema:
		 *               type: object
		 *               properties:
		 *                 accessToken:
		 *                   type: string
		 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
		 *       400:
		 *         description: Cookie `refresh_token` ausente
		 *         content:
		 *           application/json:
		 *             schema:
		 *               $ref: '#/components/schemas/ErrorResponse'
		 *       401:
		 *         description: Refresh token inválido o expirado
		 *         content:
		 *           application/json:
		 *             schema:
		 *               $ref: '#/components/schemas/ErrorResponse'
		 */
		this.router.post("/refresh", this.refreshTokenController.run);

		/**
		 * @openapi
		 * /api/auth/logout:
		 *   post:
		 *     tags: [Auth]
		 *     summary: Cerrar sesión (revocar refresh token)
		 *     description: >
		 *       Revoca el refresh token de la cookie httpOnly `refresh_token` y la
		 *       borra. El access token seguirá siendo válido hasta que expire
		 *       (máx 15 min), pero no se podrá obtener uno nuevo.
		 *     responses:
		 *       200:
		 *         description: Sesión cerrada correctamente
		 *         content:
		 *           application/json:
		 *             schema:
		 *               type: object
		 *               properties:
		 *                 message:
		 *                   type: string
		 *                   example: Sesión cerrada correctamente
		 *       400:
		 *         description: Refresh token inválido
		 *         content:
		 *           application/json:
		 *             schema:
		 *               $ref: '#/components/schemas/ErrorResponse'
		 */
		this.router.post("/logout", this.logoutController.run);
	}
}
