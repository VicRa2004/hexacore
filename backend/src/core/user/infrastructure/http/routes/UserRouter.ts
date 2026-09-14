import { Hono } from "hono";
import { injectable, inject } from "tsyringe";

import type { AuthMiddleware } from "@/modules/auth/infrastructure/http/middlewares/authMiddleware";
import type { RequirePermissionMiddleware } from "@/modules/authorization/infrastructure/http/middlewares/RequirePermissionMiddleware";

// Controladores
import { CreateUserController } from "../controllers/CreateUserController";
import { GetAllUsersController } from "../controllers/GetAllUsersController";
import { GetOneUserController } from "../controllers/GetOneUserController";
import { UpdateUserController } from "../controllers/UpdateUserController";
import { DeleteUserController } from "../controllers/DeleteUserController";

@injectable()
export class UserRouter {
	public readonly router: Hono;

	constructor(
		@inject("AuthMiddleware")
		private readonly authMiddleware: AuthMiddleware,
		@inject("RequirePermissionMiddleware")
		private readonly requirePermissionMiddleware: RequirePermissionMiddleware,
		private readonly createUserController: CreateUserController,
		private readonly getAllUsersController: GetAllUsersController,
		private readonly getOneUserController: GetOneUserController,
		private readonly updateUserController: UpdateUserController,
		private readonly deleteUserController: DeleteUserController,
	) {
		this.router = new Hono();
		this.initRoutes();
	}

	private initRoutes() {
		// Todas las rutas requieren token JWT válido
		this.router.use(this.authMiddleware.handle);

		/**
		 * @openapi
		 * /api/users:
		 *   post:
		 *     tags: [Users]
		 *     summary: Crear un nuevo usuario
		 *     security:
		 *       - bearerAuth: []
		 *     requestBody:
		 *       required: true
		 *       content:
		 *         application/json:
		 *           schema:
		 *             type: object
		 *             required: [email, name, password]
		 *             properties:
		 *               email:
		 *                 type: string
		 *                 format: email
		 *                 example: user@example.com
		 *               name:
		 *                 type: string
		 *                 example: John Doe
		 *               password:
		 *                 type: string
		 *                 format: password
		 *                 example: SecurePass123!
		 *     responses:
		 *       201:
		 *         description: Usuario creado exitosamente
		 *         content:
		 *           application/json:
		 *             schema:
		 *               $ref: '#/components/schemas/UserDto'
		 *       400:
		 *         description: Validación fallida o usuario existente
		 *         content:
		 *           application/json:
		 *             schema:
		 *               $ref: '#/components/schemas/ErrorResponse'
		 *       401:
		 *         description: No autorizado
		 *         content:
		 *           application/json:
		 *             schema:
		 *               $ref: '#/components/schemas/ErrorResponse'
		 *       403:
		 *         description: Permiso denegado (requiere users:create)
		 *         content:
		 *           application/json:
		 *             schema:
		 *               $ref: '#/components/schemas/ErrorResponse'
		 */
		// Cada ruta verifica dinámicamente en la BD si el usuario tiene
		// el permiso exacto para el recurso "users" y la acción requerida.
		this.router.post(
			"/",
			this.requirePermissionMiddleware.handle("users", "create"),
			this.createUserController.run,
		);

		/**
		 * @openapi
		 * /api/users:
		 *   get:
		 *     tags: [Users]
		 *     summary: Listar todos los usuarios
		 *     security:
		 *       - bearerAuth: []
		 *     parameters:
		 *       - in: query
		 *         name: page
		 *         schema:
		 *           type: integer
		 *           default: 1
		 *         description: Número de página
		 *       - in: query
		 *         name: limit
		 *         schema:
		 *           type: integer
		 *           default: 10
		 *         description: Cantidad de usuarios por página
		 *       - in: query
		 *         name: email
		 *         schema:
		 *           type: string
		 *         description: Filtrar por email
		 *     responses:
		 *       200:
		 *         description: Lista paginada de usuarios
		 *         content:
		 *           application/json:
		 *             schema:
		 *               type: object
		 *               properties:
		 *                 data:
		 *                   type: array
		 *                   items:
		 *                     $ref: '#/components/schemas/UserDto'
		 *                 total:
		 *                   type: integer
		 *                   example: 10
		 *                 page:
		 *                   type: integer
		 *                   example: 1
		 *                 limit:
		 *                   type: integer
		 *                   example: 10
		 *                 totalPages:
		 *                   type: integer
		 *                   example: 1
		 *       401:
		 *         description: No autorizado
		 *         content:
		 *           application/json:
		 *             schema:
		 *               $ref: '#/components/schemas/ErrorResponse'
		 *       403:
		 *         description: Permiso denegado (requiere users:read)
		 *         content:
		 *           application/json:
		 *             schema:
		 *               $ref: '#/components/schemas/ErrorResponse'
		 */
		this.router.get(
			"/",
			this.requirePermissionMiddleware.handle("users", "read"),
			this.getAllUsersController.run,
		);

		/**
		 * @openapi
		 * /api/users/{id}:
		 *   get:
		 *     tags: [Users]
		 *     summary: Obtener un usuario por ID
		 *     security:
		 *       - bearerAuth: []
		 *     parameters:
		 *       - in: path
		 *         name: id
		 *         required: true
		 *         schema:
		 *           type: integer
		 *         description: ID del usuario
		 *     responses:
		 *       200:
		 *         description: Datos del usuario encontrado
		 *         content:
		 *           application/json:
		 *             schema:
		 *               $ref: '#/components/schemas/UserDto'
		 *       401:
		 *         description: No autorizado
		 *         content:
		 *           application/json:
		 *             schema:
		 *               $ref: '#/components/schemas/ErrorResponse'
		 *       403:
		 *         description: Permiso denegado (requiere users:read)
		 *         content:
		 *           application/json:
		 *             schema:
		 *               $ref: '#/components/schemas/ErrorResponse'
		 *       404:
		 *         description: Usuario no encontrado
		 *         content:
		 *           application/json:
		 *             schema:
		 *               $ref: '#/components/schemas/ErrorResponse'
		 */
		this.router.get(
			"/:id",
			this.requirePermissionMiddleware.handle("users", "read"),
			this.getOneUserController.run,
		);

		/**
		 * @openapi
		 * /api/users/{id}:
		 *   put:
		 *     tags: [Users]
		 *     summary: Actualizar un usuario
		 *     security:
		 *       - bearerAuth: []
		 *     parameters:
		 *       - in: path
		 *         name: id
		 *         required: true
		 *         schema:
		 *           type: integer
		 *         description: ID del usuario a actualizar
		 *     requestBody:
		 *       required: true
		 *       content:
		 *         application/json:
		 *           schema:
		 *             type: object
		 *             properties:
		 *               email:
		 *                 type: string
		 *                 format: email
		 *                 example: newemail@example.com
		 *               name:
		 *                 type: string
		 *                 example: Jane Doe
		 *               password:
		 *                 type: string
		 *                 format: password
		 *                 example: NewSecurePass123!
		 *     responses:
		 *       200:
		 *         description: Usuario actualizado
		 *         content:
		 *           application/json:
		 *             schema:
		 *               $ref: '#/components/schemas/UserDto'
		 *       400:
		 *         description: Validación fallida
		 *         content:
		 *           application/json:
		 *             schema:
		 *               $ref: '#/components/schemas/ErrorResponse'
		 *       401:
		 *         description: No autorizado
		 *         content:
		 *           application/json:
		 *             schema:
		 *               $ref: '#/components/schemas/ErrorResponse'
		 *       403:
		 *         description: Permiso denegado (requiere users:update)
		 *         content:
		 *           application/json:
		 *             schema:
		 *               $ref: '#/components/schemas/ErrorResponse'
		 *       404:
		 *         description: Usuario no encontrado
		 *         content:
		 *           application/json:
		 *             schema:
		 *               $ref: '#/components/schemas/ErrorResponse'
		 */
		this.router.put(
			"/:id",
			this.requirePermissionMiddleware.handle("users", "update"),
			this.updateUserController.run,
		);

		/**
		 * @openapi
		 * /api/users/{id}:
		 *   delete:
		 *     tags: [Users]
		 *     summary: Eliminar un usuario
		 *     security:
		 *       - bearerAuth: []
		 *     parameters:
		 *       - in: path
		 *         name: id
		 *         required: true
		 *         schema:
		 *           type: integer
		 *         description: ID del usuario a eliminar
		 *     responses:
		 *       204:
		 *         description: Usuario eliminado correctamente
		 *       401:
		 *         description: No autorizado
		 *         content:
		 *           application/json:
		 *             schema:
		 *               $ref: '#/components/schemas/ErrorResponse'
		 *       403:
		 *         description: Permiso denegado (requiere users:delete)
		 *         content:
		 *           application/json:
		 *             schema:
		 *               $ref: '#/components/schemas/ErrorResponse'
		 *       404:
		 *         description: Usuario no encontrado
		 *         content:
		 *           application/json:
		 *             schema:
		 *               $ref: '#/components/schemas/ErrorResponse'
		 */
		this.router.delete(
			"/:id",
			this.requirePermissionMiddleware.handle("users", "delete"),
			this.deleteUserController.run,
		);
	}
}
