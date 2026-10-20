import type { Context, Next } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { injectable, inject } from "tsyringe";
import type { CheckUserPermissionUseCase } from "@/modules/authorization/application/useCases/CheckUserPermissionUseCase";
import { BaseError } from "@/core/shared/domain/error/BaseError";

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
		@inject("CheckUserPermissionUseCase")
		private readonly checkUserPermissionUseCase: CheckUserPermissionUseCase,
	) {}

	/**
	 * Retorna un middleware configurado para validar un recurso y acción específicos.
	 *
	 * @param resource - Nombre del recurso (ej: "turnos")
	 * @param action   - Acción requerida (ej: "create", "read", "update", "delete")
	 */
	handle = (resource: string, action: string) => {
		return async (c: Context, next: Next): Promise<Response | void> => {
			// En Hono, la convención para pasar variables entre middlewares es usar c.get()
			// Asumiendo que tu authMiddleware hace algo como: c.set('user', user)
			const user = c.get("user");
			const userId: number | undefined = user?.id;

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
			try {
				await this.checkUserPermissionUseCase.run(userId, resource, action);
			} catch (error) {
				if (error instanceof BaseError) {
					// ForbiddenError extiende BaseError; Hono tipa estrictamente los status.
					return c.json(
						{ success: false, error: error.message },
						error.code as ContentfulStatusCode,
					);
				}

				return c.json(
					{
						success: false,
						error: "Error interno al verificar permisos",
					},
					500,
				);
			}

			await next(); // Hono requiere el await en el next()
		};
	};
}
