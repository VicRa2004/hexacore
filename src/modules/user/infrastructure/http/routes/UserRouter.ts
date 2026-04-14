import { Router } from "express";
import { injectable } from "tsyringe";

import { authMiddleware } from "@/modules/auth/infrastructure/http/middlewares/authMiddleware";
import { roleMiddleware } from "@/modules/auth/infrastructure/http/middlewares/roleMiddleware";

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
    // Protegemos todas las rutas requeridas de autenticación
    this.router.use(authMiddleware);

    // Permisos
    const adminModAccess = roleMiddleware(["ADMIN", "MOD"]);
    const adminOnlyAccess = roleMiddleware(["ADMIN"]);

    this.router.post("/", adminModAccess, this.createUserController.run.bind(this.createUserController));
    this.router.get("/", adminModAccess, this.getAllUsersController.run.bind(this.getAllUsersController));
    this.router.get("/:id", adminModAccess, this.getOneUserController.run.bind(this.getOneUserController));
    this.router.put("/:id", adminModAccess, this.updateUserController.run.bind(this.updateUserController));
    this.router.delete("/:id", adminOnlyAccess, this.deleteUserController.run.bind(this.deleteUserController));
  }
}
