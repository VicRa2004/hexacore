import type { MiddlewareHandler } from "hono";

/** Contrato con el que las rutas exigen un permiso. Lo implementa el módulo `authorization`. */
export interface PermissionGuard {
	handle(resource: string, action: string): MiddlewareHandler;
}

/** Guard por defecto sin `authorization`: basta con estar autenticado (lo exige `authMiddleware`). */
export class AllowAuthenticatedGuard implements PermissionGuard {
	handle(): MiddlewareHandler {
		return (_c, next) => next();
	}
}
