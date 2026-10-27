/**
 * Agrupa las escrituras de varios repositorios en una transacción: o se guardan
 * todas o ninguna. Implementación por defecto en `container.ts`.
 */
export interface UnitOfWork {
	ejecutar<T>(trabajo: () => Promise<T>): Promise<T>;
}
