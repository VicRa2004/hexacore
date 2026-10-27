import { env } from "@/core/config/env";
import { contexto } from "./contexto";

type Nivel = "info" | "warn" | "error";

/**
 * Log con el `requestId` y el `usuarioId` de la petición en curso.
 * En prod, una línea JSON (la recogen los logs de Dokploy); en dev, legible.
 */
function escribir(
	nivel: Nivel,
	mensaje: string,
	extra?: Record<string, unknown>,
) {
	const { requestId, usuarioId } = contexto.actual();
	const salida = nivel === "info" ? console.log : console[nivel];

	if (env.NODE_ENV === "prod") {
		salida(
			JSON.stringify({ level: nivel, requestId, usuarioId, mensaje, ...extra }),
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
