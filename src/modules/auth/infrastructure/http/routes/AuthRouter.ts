import { Router } from "express";
import { injectable } from "tsyringe";
import rateLimit from "express-rate-limit";

import type { LoginController } from "../controllers/LoginController";
import type { RegisterController } from "../controllers/RegisterController";

@injectable()
export class AuthRouter {
  public readonly router: Router;

  constructor(
    private readonly loginController: LoginController,
    private readonly registerController: RegisterController,
  ) {
    this.router = Router();
    this.initRoutes();
  }

  private initRoutes() {
    // Rate limiting: máx 5 intentos por IP en 15 minutos para login
    const loginLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutos
      max: 5,
      message: "Demasiados intentos de inicio de sesión, intenta más tarde",
      standardHeaders: true,
      legacyHeaders: false,
    });

    // Rate limiting: máx 4 registros por IP en 1 hora
    const registerLimiter = rateLimit({
      windowMs: 60 * 60 * 1000, // 1 hora
      max: 4,
      message: "Demasiados registros desde esta IP, intenta más tarde",
      standardHeaders: true,
      legacyHeaders: false,
    });

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
      loginLimiter,
      this.loginController.run.bind(this.loginController),
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
      registerLimiter,
      this.registerController.run.bind(this.registerController),
    );
  }
}
