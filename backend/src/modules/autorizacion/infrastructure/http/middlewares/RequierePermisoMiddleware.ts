import type { Context, Next } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { AuthEnv } from "@/modules/auth";
import type { PermisoGuard } from "@/core/shared/infrastructure/http/permisoGuard";
import { ObtenerPermisosUsuarioUseCase } from "../../../application/useCases/ObtenerPermisosUsuarioUseCase";
import type { PermisoDto } from "../../../application/dtos/PermisoDto";
import { AccesoDenegadoError } from "../../../domain/error/AccesoDenegadoError";

/** `permisos` cachea los permisos efectivos durante la petición. */
type PermisoEnv = {
	Variables: AuthEnv["Variables"] & { permisos?: PermisoDto[] };
};

/**
 * Middleware de autorización granular (RBAC).
 * Clase inyectable que proporciona validación de permisos.
 *
 * Uso en rutas:
 * ```ts
 * app.post("/turnos",
 * authMiddleware.handle,
 * requierePermisoMiddleware.handle("turnos", "crear"),
 * controller.ejecutar.bind(controller)
 * );
 * ```
 *
 * IMPORTANTE: Debe ir DESPUÉS de `authMiddleware`, ya que depende de
 * que el usuario esté disponible en el contexto de Hono.
 */
export class RequierePermisoMiddleware implements PermisoGuard {
	constructor(
		private readonly obtenerPermisosUsuarioUseCase: ObtenerPermisosUsuarioUseCase,
	) {}

	/**
	 * Retorna un middleware configurado para validar un recurso y acción específicos.
	 *
	 * @param recurso - Nombre del recurso (ej: "turnos")
	 * @param accion   - Acción requerida (ej: "crear", "leer", "actualizar", "eliminar")
	 */
	handle = (recurso: string, accion: string) => {
		return async (
			c: Context<PermisoEnv>,
			next: Next,
		): Promise<Response | undefined> => {
			// Lo publica authMiddleware con c.set("usuario", ...)
			const usuarioId = c.get("usuario")?.id;

			if (!usuarioId) {
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
			let permisos = c.get("permisos");
			try {
				// Una sola consulta por petición aunque se encadenen varios checks.
				permisos ??=
					await this.obtenerPermisosUsuarioUseCase.ejecutar(usuarioId);
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
			c.set("permisos", permisos);

			const permitido = permisos.some(
				(p) => p.recurso === recurso && p.accion === accion,
			);

			if (!permitido) {
				const error = new AccesoDenegadoError(recurso, accion);
				return c.json(
					{ success: false, error: error.message },
					error.code as ContentfulStatusCode,
				);
			}

			await next(); // Hono requiere el await en el next()
		};
	};
}
