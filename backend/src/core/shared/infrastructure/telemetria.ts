import {
	type Attributes,
	context,
	type Meter,
	metrics,
	propagation,
	type Span,
	type SpanKind,
	SpanStatusCode,
	type Tracer,
	trace,
} from "@opentelemetry/api";
import { AsyncLocalStorageContextManager } from "@opentelemetry/context-async-hooks";
import { W3CTraceContextPropagator } from "@opentelemetry/core";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import {
	MeterProvider,
	PeriodicExportingMetricReader,
} from "@opentelemetry/sdk-metrics";
import {
	BasicTracerProvider,
	BatchSpanProcessor,
} from "@opentelemetry/sdk-trace-base";
import {
	ATTR_DEPLOYMENT_ENVIRONMENT_NAME,
	ATTR_SERVICE_NAME,
} from "@opentelemetry/semantic-conventions";
import { env } from "@/core/config/env";
import type {
	AtributosTelemetria,
	Telemetria,
} from "@/core/shared/domain/Telemetria";

let tracerProvider: BasicTracerProvider | undefined;
let meterProvider: MeterProvider | undefined;
let contextManager: AsyncLocalStorageContextManager | undefined;

/** Indica si el SDK de OpenTelemetry se arrancó (requiere `OTEL_EXPORTER_OTLP_ENDPOINT`). */
export function telemetriaActiva(): boolean {
	return tracerProvider !== undefined;
}

/**
 * Parsea `OTEL_EXPORTER_OTLP_HEADERS` según la especificación OTel (`clave=valor,clave2=valor2`).
 * Conserva signos `=` dentro del valor (p. ej. tokens Base64 en `Authorization=Basic ...==`).
 */
export function parsearCabecerasOtlp(raw?: string): Record<string, string> {
	if (!raw) return {};
	const cabeceras: Record<string, string> = {};
	for (const par of raw.split(",")) {
		const idx = par.indexOf("=");
		if (idx <= 0) continue;
		const clave = par.slice(0, idx).trim();
		const valor = par.slice(idx + 1).trim();
		if (!clave) continue;
		try {
			cabeceras[clave] = decodeURIComponent(valor);
		} catch {
			cabeceras[clave] = valor;
		}
	}
	return cabeceras;
}

function normalizarUrlOtlp(
	ruta: "/v1/traces" | "/v1/metrics",
	endpoint = env.OTEL_EXPORTER_OTLP_ENDPOINT,
): string | undefined {
	if (!endpoint) return undefined;
	const limpia = endpoint.replace(/\/+$/, "");
	return limpia.endsWith(ruta) ? limpia : `${limpia}${ruta}`;
}

/** Endpoint OTLP/HTTP para exportar trazas (`<endpoint>/v1/traces`). */
export function urlIngestaTrazas(
	endpoint = env.OTEL_EXPORTER_OTLP_ENDPOINT,
): string | undefined {
	return normalizarUrlOtlp("/v1/traces", endpoint);
}

/** Endpoint OTLP/HTTP para exportar métricas (`<endpoint>/v1/metrics`). */
export function urlIngestaMetricas(
	endpoint = env.OTEL_EXPORTER_OTLP_ENDPOINT,
): string | undefined {
	return normalizarUrlOtlp("/v1/metrics", endpoint);
}

/**
 * Arranca OpenTelemetry (trazas + métricas OTLP/HTTP) solo si existe `OTEL_EXPORTER_OTLP_ENDPOINT`.
 * Sin la variable, `@opentelemetry/api` opera en modo no-op sin coste ni tráfico de red.
 */
export function iniciarTelemetria(): void {
	if (tracerProvider || !env.OTEL_EXPORTER_OTLP_ENDPOINT) return;

	const urlTrazas = urlIngestaTrazas();
	const urlMetricas = urlIngestaMetricas();
	if (!urlTrazas || !urlMetricas) return;

	const headers = parsearCabecerasOtlp(env.OTEL_EXPORTER_OTLP_HEADERS);
	const resource = resourceFromAttributes({
		[ATTR_SERVICE_NAME]: env.OTEL_SERVICE_NAME,
		[ATTR_DEPLOYMENT_ENVIRONMENT_NAME]: env.NODE_ENV,
	});

	contextManager = new AsyncLocalStorageContextManager().enable();
	context.setGlobalContextManager(contextManager);
	propagation.setGlobalPropagator(new W3CTraceContextPropagator());

	tracerProvider = new BasicTracerProvider({
		resource,
		spanProcessors: [
			new BatchSpanProcessor(
				new OTLPTraceExporter({ url: urlTrazas, headers }),
			),
		],
	});
	trace.setGlobalTracerProvider(tracerProvider);

	meterProvider = new MeterProvider({
		resource,
		readers: [
			new PeriodicExportingMetricReader({
				exporter: new OTLPMetricExporter({ url: urlMetricas, headers }),
				exportIntervalMillis: 60_000,
			}),
		],
	});
	metrics.setGlobalMeterProvider(meterProvider);
}

/** Vacía las colas pendientes de trazas y métricas antes de apagar el proceso. */
export async function cerrarTelemetria(): Promise<void> {
	const pendientes: Promise<void>[] = [];
	if (tracerProvider) pendientes.push(tracerProvider.shutdown());
	if (meterProvider) pendientes.push(meterProvider.shutdown());
	if (pendientes.length > 0) await Promise.allSettled(pendientes);
	contextManager?.disable();
	tracerProvider = undefined;
	meterProvider = undefined;
	contextManager = undefined;
}

/** Devuelve un `Tracer` de OpenTelemetry (no-op si la telemetría no está activa). */
export function obtenerTracer(nombre = env.OTEL_SERVICE_NAME): Tracer {
	return trace.getTracer(nombre);
}

/** Devuelve un `Meter` de OpenTelemetry (no-op si la telemetría no está activa). */
export function obtenerMeter(nombre = env.OTEL_SERVICE_NAME): Meter {
	return metrics.getMeter(nombre);
}

/** Identificadores de la traza en curso para correlacionar logs con spans. */
export function traceContextActual(): { traceId?: string; spanId?: string } {
	const span = trace.getActiveSpan();
	if (!span) return {};
	const { traceId, spanId } = span.spanContext();
	if (!traceId || /^0+$/.test(traceId)) return {};
	return { traceId, spanId };
}

export interface OpcionesSpan {
	kind?: SpanKind;
	attributes?: Attributes;
	tracer?: string;
}

/**
 * Ejecuta `trabajo` dentro de un span activo. Registra la excepción y marca el span
 * como error si `trabajo` lanza, cerrándolo siempre en `finally`.
 */
export async function conSpan<T>(
	nombre: string,
	trabajo: (span: Span) => Promise<T>,
	opciones?: OpcionesSpan,
): Promise<T> {
	const tracer = obtenerTracer(opciones?.tracer);
	return tracer.startActiveSpan(
		nombre,
		{ kind: opciones?.kind, attributes: opciones?.attributes },
		async (span) => {
			try {
				return await trabajo(span);
			} catch (error) {
				span.recordException(
					error instanceof Error ? error : new Error(String(error)),
				);
				span.setStatus({
					code: SpanStatusCode.ERROR,
					message: error instanceof Error ? error.message : String(error),
				});
				throw error;
			} finally {
				span.end();
			}
		},
	);
}

/** Implementación del puerto `Telemetria` respaldada por `@opentelemetry/api`. */
export class OtelTelemetria implements Telemetria {
	conSpan<T>(
		nombre: string,
		trabajo: () => Promise<T>,
		atributos?: AtributosTelemetria,
	): Promise<T> {
		return conSpan(nombre, () => trabajo(), { attributes: atributos });
	}

	incrementarContador(
		nombre: string,
		valor = 1,
		atributos?: AtributosTelemetria,
	): void {
		obtenerMeter().createCounter(nombre).add(valor, atributos);
	}

	registrarHistograma(
		nombre: string,
		valor: number,
		atributos?: AtributosTelemetria,
	): void {
		obtenerMeter().createHistogram(nombre).record(valor, atributos);
	}
}
