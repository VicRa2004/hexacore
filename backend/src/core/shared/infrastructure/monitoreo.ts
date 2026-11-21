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

/**
 * Destino en GlitchTip de un sobre que la web manda por el túnel (`/api/monitoreo`,
 * para que los bloqueadores de anuncios no lo corten). Solo si el sobre va a nuestro
 * DSN: así el túnel no sirve de proxy hacia otros servidores.
 */
export function urlIngesta(sobre: string, dsn = env.SENTRY_DSN) {
	if (!dsn) return;
	try {
		const destino = new URL(JSON.parse(sobre.split("\n", 1)[0] ?? "").dsn);
		const propio = new URL(dsn);
		if (destino.host !== propio.host || destino.pathname !== propio.pathname)
			return;
		const ruta = propio.pathname.replace(/\/(\d+)$/, "/api/$1/envelope/");
		return `${propio.origin}${ruta}?sentry_key=${propio.username}`;
	} catch {
		return;
	}
}
