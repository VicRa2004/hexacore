import { AsyncLocalStorage } from "node:async_hooks";

/** Datos de la petición en curso, accesibles sin pasarlos por parámetro. */
export interface ContextoPeticion {
	requestId?: string;
	/** Lo añade `authMiddleware` al verificar el token. */
	usuarioId?: number;
}

const almacen = new AsyncLocalStorage<ContextoPeticion>();

export const contexto = {
	/** Contexto actual, o `{}` fuera de una petición (tareas programadas, scripts). */
	actual(): ContextoPeticion {
		return almacen.getStore() ?? {};
	},

	/** Ejecuta `trabajo` con `ctx` como contexto (middleware HTTP, despacho del outbox). */
	ejecutar<T>(ctx: ContextoPeticion, trabajo: () => T): T {
		return almacen.run(ctx, trabajo);
	},

	/** Añade datos al contexto de la petición en curso. */
	completar(datos: ContextoPeticion): void {
		const actual = almacen.getStore();
		if (actual) Object.assign(actual, datos);
	},
};
