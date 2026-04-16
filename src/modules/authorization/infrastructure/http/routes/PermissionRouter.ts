import { Router } from "express";
import { injectable } from "tsyringe";

import { authMiddleware } from "@/modules/auth/infrastructure/http/middlewares/authMiddleware";
import { requirePermission } from "@/modules/authorization/infrastructure/http/middlewares/requirePermission";

// Controladores CRUD de permisos
import { GetAllPermissionsController } from "../controllers/GetAllPermissionsController";
import { GetPermissionController } from "../controllers/GetPermissionController";
import { CreatePermissionController } from "../controllers/CreatePermissionController";
import { UpdatePermissionController } from "../controllers/UpdatePermissionController";
import { DeletePermissionController } from "../controllers/DeletePermissionController";
import { GetUserPermissionsController } from "../controllers/GetUserPermissionsController";

/**
 * Router para el módulo de autorización.
 *
 * Prefijo recomendado: /api/permissions
 *
 * Rutas expuestas:
 *  GET    /                      → listar todos los permisos del sistema
 *  GET    /:id                   → obtener un permiso por ID
 *  POST   /                      → crear un nuevo permiso
 *  PUT    /:id                   → actualizar un permiso existente
 *  DELETE /:id                   → eliminar un permiso
 *  GET    /users/:userId         → obtener permisos efectivos de un usuario
 *
 * Protección:
 *  - Todas las rutas requieren JWT válido (authMiddleware).
 *  - Cada operación requiere el permiso RBAC correspondiente sobre el recurso "permissions".
 *  - La ruta de permisos de usuario requiere el permiso "read" sobre "permissions".
 */
@injectable()
export class PermissionRouter {
  public readonly router: Router;

  constructor(
    private readonly getAllPermissionsController: GetAllPermissionsController,
    private readonly getPermissionController: GetPermissionController,
    private readonly createPermissionController: CreatePermissionController,
    private readonly updatePermissionController: UpdatePermissionController,
    private readonly deletePermissionController: DeletePermissionController,
    private readonly getUserPermissionsController: GetUserPermissionsController,
  ) {
    this.router = Router();
    this.initRoutes();
  }

  private initRoutes(): void {
    // Todas las rutas requieren token JWT válido
    this.router.use(authMiddleware);

    // GET /api/permissions/users/:userId — permisos efectivos de un usuario
    // (definida antes de /:id para evitar que "users" sea interpretado como ID)
    this.router.get(
      "/users/:userId",
      requirePermission("permissions", "read"),
      this.getUserPermissionsController.run.bind(this.getUserPermissionsController),
    );

    // GET /api/permissions
    this.router.get(
      "/",
      requirePermission("permissions", "read"),
      this.getAllPermissionsController.run.bind(this.getAllPermissionsController),
    );

    // GET /api/permissions/:id
    this.router.get(
      "/:id",
      requirePermission("permissions", "read"),
      this.getPermissionController.run.bind(this.getPermissionController),
    );

    // POST /api/permissions
    this.router.post(
      "/",
      requirePermission("permissions", "create"),
      this.createPermissionController.run.bind(this.createPermissionController),
    );

    // PUT /api/permissions/:id
    this.router.put(
      "/:id",
      requirePermission("permissions", "update"),
      this.updatePermissionController.run.bind(this.updatePermissionController),
    );

    // DELETE /api/permissions/:id
    this.router.delete(
      "/:id",
      requirePermission("permissions", "delete"),
      this.deletePermissionController.run.bind(this.deletePermissionController),
    );
  }
}
