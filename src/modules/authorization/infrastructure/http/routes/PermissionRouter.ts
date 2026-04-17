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

    /**
     * @openapi
     * /api/permissions/users/{userId}:
     *   get:
     *     tags: [Permissions]
     *     summary: Obtener permisos efectivos de un usuario
     *     parameters:
     *       - in: path
     *         name: userId
     *         required: true
     *         schema:
     *           type: integer
     *     responses:
     *       200:
     *         description: Lista de permisos del usuario
     *       401:
     *         description: No autorizado
     */
    this.router.get(
      "/users/:userId",
      requirePermission("permissions", "read"),
      this.getUserPermissionsController.run.bind(this.getUserPermissionsController),
    );

    /**
     * @openapi
     * /api/permissions:
     *   get:
     *     tags: [Permissions]
     *     summary: Listar todos los permisos
     *     responses:
     *       200:
     *         description: Lista de permisos
     */
    this.router.get(
      "/",
      requirePermission("permissions", "read"),
      this.getAllPermissionsController.run.bind(this.getAllPermissionsController),
    );

    /**
     * @openapi
     * /api/permissions/{id}:
     *   get:
     *     tags: [Permissions]
     *     summary: Obtener un permiso por ID
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *     responses:
     *       200:
     *         description: Datos del permiso
     */
    this.router.get(
      "/:id",
      requirePermission("permissions", "read"),
      this.getPermissionController.run.bind(this.getPermissionController),
    );

    /**
     * @openapi
     * /api/permissions:
     *   post:
     *     tags: [Permissions]
     *     summary: Crear un nuevo permiso
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               resource:
     *                 type: string
     *               action:
     *                 type: string
     *     responses:
     *       201:
     *         description: Permiso creado
     */
    this.router.post(
      "/",
      requirePermission("permissions", "create"),
      this.createPermissionController.run.bind(this.createPermissionController),
    );

    /**
     * @openapi
     * /api/permissions/{id}:
     *   put:
     *     tags: [Permissions]
     *     summary: Actualizar un permiso
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               resource:
     *                 type: string
     *               action:
     *                 type: string
     *     responses:
     *       200:
     *         description: Permiso actualizado
     */
    this.router.put(
      "/:id",
      requirePermission("permissions", "update"),
      this.updatePermissionController.run.bind(this.updatePermissionController),
    );

    /**
     * @openapi
     * /api/permissions/{id}:
     *   delete:
     *     tags: [Permissions]
     *     summary: Eliminar un permiso
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *     responses:
     *       204:
     *         description: Permiso eliminado
     */
    this.router.delete(
      "/:id",
      requirePermission("permissions", "delete"),
      this.deletePermissionController.run.bind(this.deletePermissionController),
    );
  }
}
