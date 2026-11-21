import { env } from "@/core/config/env";
import { contexto } from "./contexto";
import { traceContextActual } from "./telemetria";

type Nivel = "info" | "warn" | "error";

/**
 * Log con el `requestId`, `usuarioId` y (`traceId`/`spanId` si OTel está activo) de la petición.
 * En prod, una línea JSON (la recogen los logs de Dokploy); en dev, legible.
 */
function escribir(
	nivel: Nivel,
	mensaje: string,
	extra?: Record<string, unknown>,
) {
	const { requestId, usuarioId } = contexto.actual();
	const { traceId, spanId } = traceContextActual();
	const salida = nivel === "info" ? console.log : console[nivel];

	if (env.NODE_ENV === "prod") {
		salida(
			JSON.stringify({
				level: nivel,
				requestId,
				usuarioId,
				...(traceId ? { traceId, spanId } : {}),
				mensaje,
				...extra,
			}),
		);
		return;
	}
	const prefijo = requestId
		? `[${requestId}${usuarioId ? ` u:${usuarioId}` : ""}] `
		: "";
	salida(`${prefijo}${mensaje}`, ...(extra ? [extra] : []));
}

export const log = {
	info: (mensaje: string, extra?: Record<string, unknown>) =>
		escribir("info", mensaje, extra),
	warn: (mensaje: string, extra?: Record<string, unknown>) =>
		escribir("warn", mensaje, extra),
	error: (mensaje: string, extra?: Record<string, unknown>) =>
		escribir("error", mensaje, extra),
};
