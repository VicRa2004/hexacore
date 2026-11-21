import { afterEach, describe, expect, it } from "bun:test";
import { context, SpanStatusCode, trace } from "@opentelemetry/api";
import { AsyncLocalStorageContextManager } from "@opentelemetry/context-async-hooks";
import {
	BasicTracerProvider,
	InMemorySpanExporter,
	SimpleSpanProcessor,
} from "@opentelemetry/sdk-trace-base";
import {
	cerrarTelemetria,
	conSpan,
	iniciarTelemetria,
	OtelTelemetria,
	parsearCabecerasOtlp,
	telemetriaActiva,
	traceContextActual,
	urlIngestaMetricas,
	urlIngestaTrazas,
} from "./telemetria";

describe("parsearCabecerasOtlp", () => {
	it("debería parsear pares clave=valor, conservar '=' internos y decodificar URL", () => {
		expect(
			parsearCabecerasOtlp(
				"Authorization=Bearer%20tok123, x-api-key=abc==, invalida",
			),
		).toEqual({
			Authorization: "Bearer tok123",
			"x-api-key": "abc==",
		});
		expect(parsearCabecerasOtlp(undefined)).toEqual({});
		expect(parsearCabecerasOtlp("")).toEqual({});
	});
});

describe("urlIngestaTrazas y urlIngestaMetricas", () => {
	it("debería añadir el sufijo OTLP sin duplicarlo", () => {
		expect(urlIngestaTrazas("http://localhost:4318")).toBe(
			"http://localhost:4318/v1/traces",
		);
		expect(urlIngestaTrazas("http://localhost:4318/")).toBe(
			"http://localhost:4318/v1/traces",
		);
		expect(urlIngestaTrazas("http://localhost:4318/v1/traces")).toBe(
			"http://localhost:4318/v1/traces",
		);
		expect(urlIngestaMetricas("http://localhost:4318/")).toBe(
			"http://localhost:4318/v1/metrics",
		);
		expect(urlIngestaTrazas(undefined)).toBeUndefined();
	});
});

describe("telemetría desactivada por defecto", () => {
	it("no debería arrancar sin OTEL_EXPORTER_OTLP_ENDPOINT y conSpan debería ejecutar en no-op", async () => {
		iniciarTelemetria();
		expect(telemetriaActiva()).toBe(false);
		expect(traceContextActual()).toEqual({});

		const resultado = await conSpan("operacion.noop", async () => 42);
		expect(resultado).toBe(42);
		await cerrarTelemetria();
	});
});

describe("conSpan y OtelTelemetria con TracerProvider activo", () => {
	let exporter: InMemorySpanExporter;
	let provider: BasicTracerProvider;
	let manager: AsyncLocalStorageContextManager;

	afterEach(async () => {
		await provider?.shutdown();
		manager?.disable();
		trace.disable();
		context.disable();
	});

	function activarProviderPrueba() {
		exporter = new InMemorySpanExporter();
		manager = new AsyncLocalStorageContextManager().enable();
		context.setGlobalContextManager(manager);
		provider = new BasicTracerProvider({
			spanProcessors: [new SimpleSpanProcessor(exporter)],
		});
		trace.setGlobalTracerProvider(provider);
	}

	it("debería registrar spans, atributos y exponer traceContextActual dentro del span", async () => {
		activarProviderPrueba();

		let dentro: { traceId?: string; spanId?: string } = {};
		const valor = await conSpan(
			"prueba.ok",
			async () => {
				dentro = traceContextActual();
				return "listo";
			},
			{ attributes: { "pedido.id": 99 } },
		);

		expect(valor).toBe("listo");
		expect(dentro.traceId).toBeString();
		expect(dentro.spanId).toBeString();

		const spans = exporter.getFinishedSpans();
		expect(spans).toHaveLength(1);
		expect(spans[0]?.name).toBe("prueba.ok");
		expect(spans[0]?.attributes["pedido.id"]).toBe(99);
	});

	it("debería registrar la excepción y marcar ERROR cuando la función lanza", async () => {
		activarProviderPrueba();

		await expect(
			conSpan("prueba.error", async () => {
				throw new Error("fallo controlado");
			}),
		).rejects.toThrow("fallo controlado");

		const spans = exporter.getFinishedSpans();
		expect(spans).toHaveLength(1);
		expect(spans[0]?.status.code).toBe(SpanStatusCode.ERROR);
		expect(spans[0]?.events.some((e) => e.name === "exception")).toBe(true);
	});

	it("OtelTelemetria debería delegar conSpan, contador e histograma sin lanzar", async () => {
		activarProviderPrueba();
		const tel = new OtelTelemetria();

		const res = await tel.conSpan("caso_uso.probar", async () => "ok", {
			recurso: "usuarios",
		});
		tel.incrementarContador("usuarios.creados", 1, { rol: "USER" });
		tel.registrarHistograma("usuarios.duracion", 0.25);

		expect(res).toBe("ok");
		const spans = exporter.getFinishedSpans();
		expect(spans).toHaveLength(1);
		expect(spans[0]?.name).toBe("caso_uso.probar");
		expect(spans[0]?.attributes.recurso).toBe("usuarios");
	});
});
