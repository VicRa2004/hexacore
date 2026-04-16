import { Router } from "express";
import { injectable } from "tsyringe";

import { authMiddleware } from "@/modules/auth/infrastructure/http/middlewares/authMiddleware";
import { requirePermission } from "@/modules/authorization/infrastructure/http/middlewares/requirePermission";

// Controladores
import { CreateUserController } from "../controllers/CreateUserController";
import { GetAllUsersController } from "../controllers/GetAllUsersController";
import { GetOneUserController } from "../controllers/GetOneUserController";
import { UpdateUserController } from "../controllers/UpdateUserController";
import { DeleteUserController } from "../controllers/DeleteUserController";

@injectable()
export class UserRouter {
  public readonly router: Router;

  constructor(
    private readonly createUserController: CreateUserController,
    private readonly getAllUsersController: GetAllUsersController,
    private readonly getOneUserController: GetOneUserController,
    private readonly updateUserController: UpdateUserController,
    private readonly deleteUserController: DeleteUserController
  ) {
    this.router = Router();
    this.initRoutes();
  }

  private initRoutes() {
    // Todas las rutas requieren token JWT válido
    this.router.use(authMiddleware);

    // Cada ruta verifica dinámicamente en la BD si el usuario tiene
    // el permiso exacto para el recurso "users" y la acción requerida.
    this.router.post(
      "/",
      requirePermission("users", "create"),
      this.createUserController.run.bind(this.createUserController),
    );

    this.router.get(
      "/",
      requirePermission("users", "read"),
      this.getAllUsersController.run.bind(this.getAllUsersController),
    );

    this.router.get(
      "/:id",
      requirePermission("users", "read"),
      this.getOneUserController.run.bind(this.getOneUserController),
    );

    this.router.put(
      "/:id",
      requirePermission("users", "update"),
      this.updateUserController.run.bind(this.updateUserController),
    );

    this.router.delete(
      "/:id",
      requirePermission("users", "delete"),
      this.deleteUserController.run.bind(this.deleteUserController),
    );
  }
}

