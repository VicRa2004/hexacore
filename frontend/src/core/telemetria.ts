import {
	type Attributes,
	context,
	propagation,
	type Span,
	SpanStatusCode,
	trace,
} from "@opentelemetry/api";

const activa = import.meta.env.VITE_OTEL_ENABLED === "true";
const endpointPersonalizado = import.meta.env.VITE_OTEL_EXPORTER_OTLP_ENDPOINT;
const nombreServicio = import.meta.env.VITE_OTEL_SERVICE_NAME || "hexacore-web";

let iniciada = false;

/** Indica si la telemetría web se compiló activada (`VITE_OTEL_ENABLED="true"`). */
export function telemetriaActiva(): boolean {
	return activa;
}

/**
 * Arranca OpenTelemetry en el navegador solo si se compiló con `VITE_OTEL_ENABLED="true"`.
 * Carga el SDK de forma diferida para no engordar el bundle inicial y envía las trazas
 * al túnel del propio backend (`/api/telemetria/v1/traces`), sin exponer credenciales del colector.
 */
export function iniciarTelemetria(): void {
	if (!activa || iniciada) return;
	iniciada = true;

	void Promise.all([
		import("@opentelemetry/core"),
		import("@opentelemetry/exporter-trace-otlp-http"),
		import("@opentelemetry/resources"),
		import("@opentelemetry/sdk-trace-base"),
		import("@opentelemetry/sdk-trace-web"),
		import("@opentelemetry/semantic-conventions"),
	]).then(
		([
			{ W3CTraceContextPropagator },
			{ OTLPTraceExporter },
			{ resourceFromAttributes },
			{ BatchSpanProcessor },
			{ WebTracerProvider },
			{ ATTR_DEPLOYMENT_ENVIRONMENT_NAME, ATTR_SERVICE_NAME },
		]) => {
			const url = endpointPersonalizado
				? `${endpointPersonalizado.replace(/\/+$/, "")}/v1/traces`
				: `${window.location.origin}/api/telemetria/v1/traces`;

			const provider = new WebTracerProvider({
				resource: resourceFromAttributes({
					[ATTR_SERVICE_NAME]: nombreServicio,
					[ATTR_DEPLOYMENT_ENVIRONMENT_NAME]: import.meta.env.MODE,
				}),
				spanProcessors: [
					new BatchSpanProcessor(new OTLPTraceExporter({ url })),
				],
			});

			provider.register({
				propagator: new W3CTraceContextPropagator(),
			});
		},
	);
}

/**
 * Ejecuta `trabajo` dentro de un span activo (no-op si `VITE_OTEL_ENABLED` no es `"true"`).
 * Útil para trazar flujos de usuario que disparen una o varias llamadas a la API.
 */
export async function conSpan<T>(
	nombre: string,
	trabajo: (span: Span) => Promise<T>,
	atributos?: Attributes,
): Promise<T> {
	return trace
		.getTracer(nombreServicio)
		.startActiveSpan(nombre, { attributes: atributos }, async (span) => {
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
		});
}

/**
 * Inyecta `traceparent` / `tracestate` del span activo en las cabeceras de una
 * petición saliente para enlazar la traza del navegador con la del backend.
 */
export function inyectarCabecerasTraza(
	asignar: (clave: string, valor: string) => void,
): void {
	if (!activa) return;
	propagation.inject(context.active(), null, {
		set: (_carrier, clave, valor) => asignar(clave, valor),
	});
}
