import type { OpenAPIHono } from "@hono/zod-openapi";
import type { DependencyContainer } from "./DependencyContainer";

/** Módulo enchufable: se activa o se quita en la lista de `src/modules.ts`. */
export interface AppModule {
	/** Registra en el contenedor lo que comparte con otros módulos o sustituye (opcional). */
	register?(container: DependencyContainer): void;
	/** Construye sus casos de uso y controladores y monta sus rutas en la app. */
	mount(app: OpenAPIHono, container: DependencyContainer): void;
	/**
	 * Tareas al arrancar el servidor (no se ejecuta al exportar el OpenAPI).
	 * Puede devolver una función que las detiene en el apagado ordenado.
	 */
	onStart?(container: DependencyContainer): (() => void) | undefined;
}
