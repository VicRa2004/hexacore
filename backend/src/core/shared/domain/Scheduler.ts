/**
 * Tareas periódicas. Los módulos las programan en `onStart`; la implementación
 * (intervalos en proceso, cron externo, `pg_cron`…) se elige en `container.ts`.
 */
export interface Scheduler {
	/** `nombre` identifica la tarea en los logs (p. ej. "auth.limpiar-tokens"). */
	programar(nombre: string, cadaMs: number, tarea: () => Promise<void>): void;
	/** Detiene todas las tareas (apagado ordenado). */
	detener(): void;
}
