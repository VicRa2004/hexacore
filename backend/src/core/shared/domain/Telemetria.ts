export type AtributosTelemetria = Record<string, string | number | boolean>;

/**
 * Puerto de observabilidad para casos de uso que quieran medir operaciones o
 * métricas de negocio sin acoplarse a OpenTelemetry.
 */
export interface Telemetria {
	conSpan<T>(
		nombre: string,
		trabajo: () => Promise<T>,
		atributos?: AtributosTelemetria,
	): Promise<T>;
	incrementarContador(
		nombre: string,
		valor?: number,
		atributos?: AtributosTelemetria,
	): void;
	registrarHistograma(
		nombre: string,
		valor: number,
		atributos?: AtributosTelemetria,
	): void;
}
