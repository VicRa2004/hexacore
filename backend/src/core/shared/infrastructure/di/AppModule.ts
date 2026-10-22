import type { OpenAPIHono } from "@hono/zod-openapi";
import type { DependencyContainer } from "tsyringe";

/** Módulo enchufable: se activa o se quita en la lista de `src/modules.ts`. */
export interface AppModule {
	/** Registra en el contenedor los repos, servicios y middlewares del módulo. */
	register(container: DependencyContainer): void;
	/** Monta sus rutas en la app. */
	mount(app: OpenAPIHono, container: DependencyContainer): void;
	/**
	 * Tareas al arrancar el servidor (no se ejecuta al exportar el OpenAPI).
	 * Puede devolver una función que las detiene en el apagado ordenado.
	 */
	onStart?(container: DependencyContainer): (() => void) | undefined;
}
