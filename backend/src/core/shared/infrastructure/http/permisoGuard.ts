import type { MiddlewareHandler } from "hono";

/** Contrato con el que las rutas exigen un permiso. Lo implementa el módulo `autorizacion`. */
export interface PermisoGuard {
	handle(recurso: string, accion: string): MiddlewareHandler;
}

/** Guard por defecto sin `autorizacion`: basta con estar autenticado (lo exige `authMiddleware`). */
export class PermitirAutenticadoGuard implements PermisoGuard {
	handle(): MiddlewareHandler {
		return (_c, next) => next();
	}
}
