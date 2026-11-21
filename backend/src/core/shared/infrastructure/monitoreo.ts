import * as Sentry from "@sentry/bun";
import { env } from "@/core/config/env";

/**
 * Errores a Sentry o GlitchTip si hay `SENTRY_DSN`; si no, no hace nada.
 * Sin datos personales ni contenido: del usuario solo va el id y de la petición, método y ruta.
 */
export function iniciarMonitoreo() {
	if (!env.SENTRY_DSN) return;
	Sentry.init({
		dsn: env.SENTRY_DSN,
		environment: env.NODE_ENV,
		beforeSend: limpiarEvento,
	});
}

export function limpiarEvento<T extends Sentry.ErrorEvent>(evento: T): T {
	if (evento.request) {
		evento.request = {
			method: evento.request.method,
			url: evento.request.url?.split("?")[0],
		};
	}
	if (evento.user) evento.user = { id: evento.user.id };
	// Los logs de consola y las consultas pueden llevar correos o contenido.
	evento.breadcrumbs = undefined;
	return evento;
}

/** Error no controlado de una petición, etiquetado con su `requestId` y el id del usuario. */
export function reportarError(
	error: unknown,
	{ requestId, usuarioId }: { requestId?: string; usuarioId?: number },
) {
	if (!env.SENTRY_DSN) return;
	Sentry.withScope((scope) => {
		if (requestId) scope.setTag("requestId", requestId);
		if (usuarioId) scope.setUser({ id: String(usuarioId) });
		Sentry.captureException(error);
	});
}

/** Vacía la cola de eventos pendientes antes de cerrar el proceso. */
export async function cerrarMonitoreo() {
	if (!env.SENTRY_DSN) return;
	await Sentry.close(2_000);
}

function primeraLinea(sobre: string | Uint8Array): string {
	if (typeof sobre === "string") return sobre.split(/\r?\n/, 1)[0] ?? "";
	const salto = sobre.indexOf(0x0a);
	const cabecera = salto === -1 ? sobre : sobre.subarray(0, salto);
	return new TextDecoder().decode(cabecera);
}

/**
 * Destino en GlitchTip/Sentry de un sobre que la web manda por el túnel (`/api/monitoreo`,
 * para que los bloqueadores de anuncios no lo corten). Solo si el sobre va a nuestro
 * DSN: así el túnel no sirve de proxy hacia otros servidores.
 */
export function urlIngesta(
	sobre: string | Uint8Array,
	dsn = env.SENTRY_DSN,
): string | undefined {
	if (!dsn) return;
	try {
		const cabecera = JSON.parse(primeraLinea(sobre)) as { dsn?: unknown };
		if (typeof cabecera.dsn !== "string") return;
		const destino = new URL(cabecera.dsn);
		const propio = new URL(dsn);
		if (
			!propio.username ||
			destino.origin !== propio.origin ||
			destino.pathname !== propio.pathname ||
			destino.username !== propio.username
		) {
			return;
		}
		const match = propio.pathname.match(/^(.*)\/(\d+)$/);
		if (!match) return;
		const [, prefijo, proyectoId] = match;
		return `${propio.origin}${prefijo}/api/${proyectoId}/envelope/?sentry_key=${encodeURIComponent(propio.username)}`;
	} catch {
		return;
	}
}
