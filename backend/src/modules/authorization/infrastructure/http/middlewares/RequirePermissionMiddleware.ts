import type { Context, Next } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { injectable } from "tsyringe";
import type { AuthEnv } from "@/modules/auth";
import { GetUserPermissionsUseCase } from "../../../application/useCases/GetUserPermissionsUseCase";
import type { PermissionDto } from "../../../application/dtos/PermissionDto";
import { ForbiddenError } from "../../../domain/error/ForbiddenError";

/** `permissions` cachea los permisos efectivos durante la petición. */
type PermissionEnv = {
	Variables: AuthEnv["Variables"] & { permissions?: PermissionDto[] };
};

/**
 * Middleware de autorización granular (RBAC).
 * Clase inyectable que proporciona validación de permisos.
 *
 * Uso en rutas:
 * ```ts
 * app.post("/turnos",
 * authMiddleware.handle,
 * requirePermissionMiddleware.handle("turnos", "create"),
 * controller.run.bind(controller)
 * );
 * ```
 *
 * IMPORTANTE: Debe ir DESPUÉS de `authMiddleware`, ya que depende de
 * que el usuario esté disponible en el contexto de Hono.
 */
@injectable()
export class RequirePermissionMiddleware {
	constructor(
		private readonly getUserPermissionsUseCase: GetUserPermissionsUseCase,
	) {}

	/**
	 * Retorna un middleware configurado para validar un recurso y acción específicos.
	 *
	 * @param resource - Nombre del recurso (ej: "turnos")
	 * @param action   - Acción requerida (ej: "create", "read", "update", "delete")
	 */
	handle = (resource: string, action: string) => {
		return async (
			c: Context<PermissionEnv>,
			next: Next,
		): Promise<Response | void> => {
			// Lo publica authMiddleware con c.set("user", ...)
			const userId = c.get("user")?.id;

			if (!userId) {
				return c.json(
					{
						success: false,
						error: "Usuario no autenticado. Ejecuta authMiddleware antes.",
					},
					401,
				);
			}

			// next() queda fuera del try: un error del controlador no debe
			// confundirse con un fallo de verificación de permisos.
			let permissions = c.get("permissions");
			try {
				// Una sola consulta por petición aunque se encadenen varios checks.
				permissions ??= await this.getUserPermissionsUseCase.run(userId);
			} catch (error) {
				console.error(error);
				return c.json(
					{
						success: false,
						error: "Error interno al verificar permisos",
					},
					500,
				);
			}
			c.set("permissions", permissions);

			const allowed = permissions.some(
				(p) => p.resource === resource && p.action === action,
			);

			if (!allowed) {
				const error = new ForbiddenError(resource, action);
				return c.json(
					{ success: false, error: error.message },
					error.code as ContentfulStatusCode,
				);
			}

			await next(); // Hono requiere el await en el next()
		};
	};
}
