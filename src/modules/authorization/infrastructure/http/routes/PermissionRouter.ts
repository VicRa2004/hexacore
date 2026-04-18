import { Hono } from "hono";
import { injectable, inject } from "tsyringe";

import type { AuthMiddleware } from "@/modules/auth/infrastructure/http/middlewares/authMiddleware";
import type { RequirePermissionMiddleware } from "@/modules/authorization/infrastructure/http/middlewares/RequirePermissionMiddleware";

// Controladores CRUD de permisos
import { GetAllPermissionsController } from "../controllers/GetAllPermissionsController";
import { GetPermissionController } from "../controllers/GetPermissionController";
import { CreatePermissionController } from "../controllers/CreatePermissionController";
import { UpdatePermissionController } from "../controllers/UpdatePermissionController";
import { DeletePermissionController } from "../controllers/DeletePermissionController";
import { GetUserPermissionsController } from "../controllers/GetUserPermissionsController";

@injectable()
export class PermissionRouter {
  public readonly router: Hono;

  constructor(
    @inject("AuthMiddleware")
    private readonly authMiddleware: AuthMiddleware,
    @inject("RequirePermissionMiddleware")
    private readonly requirePermissionMiddleware: RequirePermissionMiddleware,
    private readonly getAllPermissionsController: GetAllPermissionsController,
    private readonly getPermissionController: GetPermissionController,
    private readonly createPermissionController: CreatePermissionController,
    private readonly updatePermissionController: UpdatePermissionController,
    private readonly deletePermissionController: DeletePermissionController,
    private readonly getUserPermissionsController: GetUserPermissionsController,
  ) {
    this.router = new Hono();
    this.initRoutes();
  }

  private initRoutes(): void {
    this.router.use(this.authMiddleware.handle);

    this.router.get(
      "/users/:userId",
      this.requirePermissionMiddleware.handle("permissions", "read"),
      this.getUserPermissionsController.run,
    );

    this.router.get(
      "/",
      this.requirePermissionMiddleware.handle("permissions", "read"),
      this.getAllPermissionsController.run,
    );

    this.router.get(
      "/:id",
      this.requirePermissionMiddleware.handle("permissions", "read"),
      this.getPermissionController.run,
    );

    this.router.post(
      "/",
      this.requirePermissionMiddleware.handle("permissions", "create"),
      this.createPermissionController.run,
    );

    this.router.put(
      "/:id",
      this.requirePermissionMiddleware.handle("permissions", "update"),
      this.updatePermissionController.run,
    );

    this.router.delete(
      "/:id",
      this.requirePermissionMiddleware.handle("permissions", "delete"),
      this.deletePermissionController.run,
    );
  }
}
