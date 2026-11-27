import { afterEach, describe, expect, it, spyOn } from "bun:test";
import { metrics } from "@opentelemetry/api";
import {
	AggregationTemporality,
	InMemoryMetricExporter,
	MeterProvider,
	PeriodicExportingMetricReader,
} from "@opentelemetry/sdk-metrics";
import { IntervalScheduler } from "./IntervalScheduler";

const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));

describe("IntervalScheduler", () => {
	const scheduler = new IntervalScheduler();
	afterEach(() => scheduler.detener());

	it("no solapa una ejecución con la anterior", async () => {
		let ejecuciones = 0;
		scheduler.programar("lenta", 5, async () => {
			ejecuciones++;
			await esperar(40);
		});

		await esperar(30);

		expect(ejecuciones).toBe(1);
	});

	it("sigue ejecutando la tarea aunque falle", async () => {
		const consola = spyOn(console, "error").mockImplementation(() => {});
		let intentos = 0;
		scheduler.programar("rota", 5, async () => {
			intentos++;
			throw new Error("fallo");
		});

		await esperar(30);

		expect(intentos).toBeGreaterThan(1);
		consola.mockRestore();
	});

	it("detener para todas las tareas", async () => {
		let ejecuciones = 0;
		scheduler.programar("contador", 5, async () => {
			ejecuciones++;
		});
		scheduler.detener();

		await esperar(20);

		expect(ejecuciones).toBe(0);
	});

	it("registra ejecuciones y duración con su resultado", async () => {
		const consola = spyOn(console, "error").mockImplementation(() => {});
		const exportador = new InMemoryMetricExporter(
			AggregationTemporality.CUMULATIVE,
		);
		const lector = new PeriodicExportingMetricReader({
			exporter: exportador,
			exportIntervalMillis: 60_000,
		});
		const proveedor = new MeterProvider({ readers: [lector] });
		metrics.setGlobalMeterProvider(proveedor);

		try {
			let n = 0;
			scheduler.programar("alterna", 5, async () => {
				if (n++ === 0) throw new Error("fallo");
			});
			await esperar(30);
			scheduler.detener();
			await lector.forceFlush();

			const datos = exportador
				.getMetrics()
				.flatMap((r) => r.scopeMetrics.flatMap((s) => s.metrics));
			const ejecuciones = datos.find(
				(m) => m.descriptor.name === "scheduler.ejecuciones",
			);
			const resultados = ejecuciones?.dataPoints.map(
				(p) => p.attributes.resultado,
			);
			expect(resultados).toContain("ok");
			expect(resultados).toContain("error");
			expect(
				datos.some((m) => m.descriptor.name === "scheduler.duracion"),
			).toBe(true);
		} finally {
			await proveedor.shutdown();
			metrics.disable();
			consola.mockRestore();
		}
	});
});
