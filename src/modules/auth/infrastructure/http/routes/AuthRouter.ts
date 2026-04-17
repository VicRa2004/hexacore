import { Router } from "express";
import { injectable } from "tsyringe";

import { LoginController } from "../controllers/LoginController";
import { RegisterController } from "../controllers/RegisterController";

@injectable()
export class AuthRouter {
  public readonly router: Router;

  constructor(
    private readonly loginController: LoginController,
    private readonly registerController: RegisterController
  ) {
    this.router = Router();
    this.initRoutes();
  }

  private initRoutes() {
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
    this.router.post("/login", this.loginController.run.bind(this.loginController));

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
    this.router.post("/register", this.registerController.run.bind(this.registerController));
  }
}
