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

		/**
		 * @openapi
		 * /api/permissions/users/{userId}:
		 *   get:
		 *     tags: [Permissions]
		 *     summary: Obtener los permisos asignados a un usuario
		 *     security:
		 *       - bearerAuth: []
		 *     parameters:
		 *       - in: path
		 *         name: userId
		 *         required: true
		 *         schema:
		 *           type: integer
		 *         description: ID numérico del usuario
		 *     responses:
		 *       200:
		 *         description: Lista de permisos asignados al usuario
		 *         content:
		 *           application/json:
		 *             schema:
		 *               type: array
		 *               items:
		 *                 $ref: '#/components/schemas/PermissionDto'
		 *       401:
		 *         description: No autenticado
		 *         content:
		 *           application/json:
		 *             schema:
		 *               $ref: '#/components/schemas/ErrorResponse'
		 *       403:
		 *         description: Permiso denegado (requiere permissions:read)
		 *         content:
		 *           application/json:
		 *             schema:
		 *               $ref: '#/components/schemas/ErrorResponse'
		 */
		this.router.get(
			"/users/:userId",
			this.requirePermissionMiddleware.handle("permissions", "read"),
			this.getUserPermissionsController.run,
		);

		/**
		 * @openapi
		 * /api/permissions:
		 *   get:
		 *     tags: [Permissions]
		 *     summary: Listar todos los permisos del sistema
		 *     security:
		 *       - bearerAuth: []
		 *     responses:
		 *       200:
		 *         description: Lista de permisos existentes
		 *         content:
		 *           application/json:
		 *             schema:
		 *               type: array
		 *               items:
		 *                 $ref: '#/components/schemas/PermissionDto'
		 *       401:
		 *         description: No autenticado
		 *         content:
		 *           application/json:
		 *             schema:
		 *               $ref: '#/components/schemas/ErrorResponse'
		 *       403:
		 *         description: Permiso denegado (requiere permissions:read)
		 *         content:
		 *           application/json:
		 *             schema:
		 *               $ref: '#/components/schemas/ErrorResponse'
		 */
		this.router.get(
			"/",
			this.requirePermissionMiddleware.handle("permissions", "read"),
			this.getAllPermissionsController.run,
		);

		/**
		 * @openapi
		 * /api/permissions/{id}:
		 *   get:
		 *     tags: [Permissions]
		 *     summary: Obtener un permiso por ID
		 *     security:
		 *       - bearerAuth: []
		 *     parameters:
		 *       - in: path
		 *         name: id
		 *         required: true
		 *         schema:
		 *           type: integer
		 *         description: ID del permiso
		 *     responses:
		 *       200:
		 *         description: Datos del permiso solicitado
		 *         content:
		 *           application/json:
		 *             schema:
		 *               $ref: '#/components/schemas/PermissionDto'
		 *       401:
		 *         description: No autenticado
		 *         content:
		 *           application/json:
		 *             schema:
		 *               $ref: '#/components/schemas/ErrorResponse'
		 *       403:
		 *         description: Permiso denegado (requiere permissions:read)
		 *         content:
		 *           application/json:
		 *             schema:
		 *               $ref: '#/components/schemas/ErrorResponse'
		 *       404:
		 *         description: Permiso no encontrado
		 *         content:
		 *           application/json:
		 *             schema:
		 *               $ref: '#/components/schemas/ErrorResponse'
		 */
		this.router.get(
			"/:id",
			this.requirePermissionMiddleware.handle("permissions", "read"),
			this.getPermissionController.run,
		);

		/**
		 * @openapi
		 * /api/permissions:
		 *   post:
		 *     tags: [Permissions]
		 *     summary: Crear un nuevo permiso
		 *     security:
		 *       - bearerAuth: []
		 *     requestBody:
		 *       required: true
		 *       content:
		 *         application/json:
		 *           schema:
		 *             type: object
		 *             required: [resource, action]
		 *             properties:
		 *               resource:
		 *                 type: string
		 *                 maxLength: 100
		 *                 example: users
		 *               action:
		 *                 type: string
		 *                 maxLength: 50
		 *                 example: write
		 *     responses:
		 *       201:
		 *         description: Permiso creado exitosamente
		 *         content:
		 *           application/json:
		 *             schema:
		 *               $ref: '#/components/schemas/PermissionDto'
		 *       400:
		 *         description: Validación fallida o permiso duplicado
		 *         content:
		 *           application/json:
		 *             schema:
		 *               $ref: '#/components/schemas/ErrorResponse'
		 *       401:
		 *         description: No autenticado
		 *         content:
		 *           application/json:
		 *             schema:
		 *               $ref: '#/components/schemas/ErrorResponse'
		 *       403:
		 *         description: Permiso denegado (requiere permissions:create)
		 *         content:
		 *           application/json:
		 *             schema:
		 *               $ref: '#/components/schemas/ErrorResponse'
		 */
		this.router.post(
			"/",
			this.requirePermissionMiddleware.handle("permissions", "create"),
			this.createPermissionController.run,
		);

		/**
		 * @openapi
		 * /api/permissions/{id}:
		 *   put:
		 *     tags: [Permissions]
		 *     summary: Actualizar un permiso
		 *     security:
		 *       - bearerAuth: []
		 *     parameters:
		 *       - in: path
		 *         name: id
		 *         required: true
		 *         schema:
		 *           type: integer
		 *         description: ID del permiso
		 *     requestBody:
		 *       required: true
		 *       content:
		 *         application/json:
		 *           schema:
		 *             type: object
		 *             properties:
		 *               resource:
		 *                 type: string
		 *                 maxLength: 100
		 *                 example: users
		 *               action:
		 *                 type: string
		 *                 maxLength: 50
		 *                 example: manage
		 *     responses:
		 *       200:
		 *         description: Permiso actualizado exitosamente
		 *         content:
		 *           application/json:
		 *             schema:
		 *               $ref: '#/components/schemas/PermissionDto'
		 *       400:
		 *         description: Validación fallida o conflicto
		 *         content:
		 *           application/json:
		 *             schema:
		 *               $ref: '#/components/schemas/ErrorResponse'
		 *       401:
		 *         description: No autenticado
		 *         content:
		 *           application/json:
		 *             schema:
		 *               $ref: '#/components/schemas/ErrorResponse'
		 *       403:
		 *         description: Permiso denegado (requiere permissions:update)
		 *         content:
		 *           application/json:
		 *             schema:
		 *               $ref: '#/components/schemas/ErrorResponse'
		 *       404:
		 *         description: Permiso no encontrado
		 *         content:
		 *           application/json:
		 *             schema:
		 *               $ref: '#/components/schemas/ErrorResponse'
		 */
		this.router.put(
			"/:id",
			this.requirePermissionMiddleware.handle("permissions", "update"),
			this.updatePermissionController.run,
		);

		/**
		 * @openapi
		 * /api/permissions/{id}:
		 *   delete:
		 *     tags: [Permissions]
		 *     summary: Eliminar un permiso
		 *     security:
		 *       - bearerAuth: []
		 *     parameters:
		 *       - in: path
		 *         name: id
		 *         required: true
		 *         schema:
		 *           type: integer
		 *         description: ID del permiso a eliminar
		 *     responses:
		 *       204:
		 *         description: Permiso eliminado correctamente
		 *       401:
		 *         description: No autenticado
		 *         content:
		 *           application/json:
		 *             schema:
		 *               $ref: '#/components/schemas/ErrorResponse'
		 *       403:
		 *         description: Permiso denegado (requiere permissions:delete)
		 *         content:
		 *           application/json:
		 *             schema:
		 *               $ref: '#/components/schemas/ErrorResponse'
		 *       404:
		 *         description: Permiso no encontrado
		 *         content:
		 *           application/json:
		 *             schema:
		 *               $ref: '#/components/schemas/ErrorResponse'
		 */
		this.router.delete(
			"/:id",
			this.requirePermissionMiddleware.handle("permissions", "delete"),
			this.deletePermissionController.run,
		);
	}
}
