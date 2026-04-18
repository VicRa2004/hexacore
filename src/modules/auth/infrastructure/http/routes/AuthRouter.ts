import { Hono } from "hono";
import { injectable } from "tsyringe";

import { LoginController } from "../controllers/LoginController";
import { RegisterController } from "../controllers/RegisterController";
import { RefreshTokenController } from "../controllers/RefreshTokenController";
import { LogoutController } from "../controllers/LogoutController";

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
    // TODO: Implement rate limiting for Hono (e.g., using a custom middleware or a package)
    // - Rate limiting: máx 5 intentos por IP en 15 minutos para login
    // - Rate limiting: máx 4 registros por IP en 1 hora

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
     *             properties:
     *               email:
     *                 type: string
     *               password:
     *                 type: string
     *     responses:
     *       200:
     *         description: Login exitoso, devuelve accessToken y refreshToken
     *       401:
     *         description: Credenciales inválidas
     */
    this.router.post(
      "/login",
      this.loginController.run,
    );

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
     *             properties:
     *               email:
     *                 type: string
     *               password:
     *                 type: string
     *               name:
     *                 type: string
     *     responses:
     *       201:
     *         description: Usuario registrado exitosamente
     */
    this.router.post(
      "/register",
      this.registerController.run,
    );

    /**
     * @openapi
     * /api/auth/refresh:
     *   post:
     *     tags: [Auth]
     *     summary: Renovar tokens usando un refresh token válido
     *     description: >
     *       Rota el refresh token: el token enviado se revoca y se genera
     *       un nuevo par accessToken + refreshToken (Refresh Token Rotation).
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               refreshToken:
     *                 type: string
     *     responses:
     *       200:
     *         description: Tokens renovados exitosamente
     *       401:
     *         description: Refresh token inválido o expirado
     */
    this.router.post(
      "/refresh",
      this.refreshTokenController.run,
    );

    /**
     * @openapi
     * /api/auth/logout:
     *   post:
     *     tags: [Auth]
     *     summary: Cerrar sesión (revocar refresh token)
     *     description: >
     *       Revoca el refresh token proporcionado. El access token seguirá
     *       siendo válido hasta que expire (máx 15 min), pero no se podrá
     *       obtener uno nuevo.
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               refreshToken:
     *                 type: string
     *     responses:
     *       200:
     *         description: Sesión cerrada correctamente
     *       400:
     *         description: Refresh token inválido
     */
    this.router.post(
      "/logout",
      this.logoutController.run,
    );
  }
}
