import {
	context,
	propagation,
	SpanKind,
	SpanStatusCode,
	type TextMapGetter,
} from "@opentelemetry/api";
import {
	ATTR_HTTP_REQUEST_METHOD,
	ATTR_HTTP_RESPONSE_STATUS_CODE,
	ATTR_HTTP_ROUTE,
	ATTR_URL_PATH,
} from "@opentelemetry/semantic-conventions";
import type { MiddlewareHandler } from "hono";
import { routePath } from "hono/route";
import { contexto } from "../contexto";
import { obtenerMeter, obtenerTracer, telemetriaActiva } from "../telemetria";

const RUTAS_IGNORADAS = new Set([
	"/health",
	"/ready",
	"/api/monitoreo",
	"/api/telemetria/v1/traces",
]);

const getterHeaders: TextMapGetter<Headers> = {
	keys: (carrier) => Array.from(carrier.keys()),
	get: (carrier, key) => carrier.get(key) ?? undefined,
};

/**
 * Middleware HTTP de OpenTelemetry para Hono.
 * - Si la telemetría no está activa, delega directo a `next()` sin coste.
 * - Extrae el contexto W3C (`traceparent`/`tracestate`) de los headers entrantes.
 * - Registra un span `SERVER` y métricas estándar de duración y peticiones activas.
 */
export function telemetriaHttp(): MiddlewareHandler {
	return async (c, next) => {
		if (!telemetriaActiva() || RUTAS_IGNORADAS.has(c.req.path)) {
			return next();
		}

		const metodo = c.req.method;
		const rutaInicial = c.req.path;
		const contextoPadre = propagation.extract(
			context.active(),
			c.req.raw.headers,
			getterHeaders,
		);

		const tracer = obtenerTracer();
		const meter = obtenerMeter();
		const activas = meter.createUpDownCounter("http.server.active_requests");
		const duracion = meter.createHistogram("http.server.request.duration", {
			unit: "s",
		});

		const inicio = performance.now();
		activas.add(1, { [ATTR_HTTP_REQUEST_METHOD]: metodo });

		return context.with(contextoPadre, () =>
			tracer.startActiveSpan(
				`${metodo} ${rutaInicial}`,
				{
					kind: SpanKind.SERVER,
					attributes: {
						[ATTR_HTTP_REQUEST_METHOD]: metodo,
						[ATTR_URL_PATH]: rutaInicial,
					},
				},
				async (span) => {
					const { requestId } = contexto.actual();
					if (requestId) span.setAttribute("hexacore.request_id", requestId);

					try {
						await next();
					} finally {
						const ruta = routePath(c) || rutaInicial;
						const status = c.res.status;
						const { usuarioId } = contexto.actual();

						span.updateName(`${metodo} ${ruta}`);
						span.setAttribute(ATTR_HTTP_ROUTE, ruta);
						span.setAttribute(ATTR_HTTP_RESPONSE_STATUS_CODE, status);
						if (usuarioId) span.setAttribute("usuario.id", usuarioId);

						if (c.error) {
							span.recordException(c.error);
						}
						if (status >= 500) {
							span.setStatus({
								code: SpanStatusCode.ERROR,
								message: c.error?.message ?? `HTTP ${status}`,
							});
						}

						const segundos = (performance.now() - inicio) / 1000;
						duracion.record(segundos, {
							[ATTR_HTTP_REQUEST_METHOD]: metodo,
							[ATTR_HTTP_ROUTE]: ruta,
							[ATTR_HTTP_RESPONSE_STATUS_CODE]: status,
						});
						activas.add(-1, { [ATTR_HTTP_REQUEST_METHOD]: metodo });
						span.end();
					}
				},
			),
		);
	};
}
