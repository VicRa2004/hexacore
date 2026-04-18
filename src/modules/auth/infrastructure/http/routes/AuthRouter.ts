import { Hono } from "hono";
import { injectable } from "tsyringe";

import { LoginController } from "../controllers/LoginController";
import { RegisterController } from "../controllers/RegisterController";

@injectable()
export class AuthRouter {
  public readonly router: Hono;

  constructor(
    private readonly loginController: LoginController,
    private readonly registerController: RegisterController,
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
     *         description: Login exitoso, devuelve JWT
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
  }
}
