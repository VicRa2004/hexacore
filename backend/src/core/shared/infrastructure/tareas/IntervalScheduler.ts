import type { Scheduler } from "@/core/shared/domain/Scheduler";
import { log } from "../logger";
import { conSpan, obtenerMeter } from "../telemetria";

/**
 * Scheduler en proceso con `setInterval`. Una ejecución no se solapa con la
 * anterior y sus errores se loguean sin parar la tarea.
 *
 * shortcut: con N réplicas cada una ejecuta las tareas; si alguna no es idempotente,
 * sustituirlo por un cron único (ver docs/escalado.md).
 */
export class IntervalScheduler implements Scheduler {
	private intervalos: ReturnType<typeof setInterval>[] = [];

	programar(nombre: string, cadaMs: number, tarea: () => Promise<void>): void {
		let enCurso = false;
		this.intervalos.push(
			setInterval(async () => {
				if (enCurso) return;
				enCurso = true;
				const inicio = performance.now();
				let resultado = "ok";
				try {
					await conSpan(`scheduler.${nombre}`, () => tarea(), {
						attributes: { "scheduler.tarea": nombre },
					});
				} catch (error) {
					resultado = "error";
					log.error(`Falló la tarea "${nombre}"`, { error: String(error) });
				} finally {
					enCurso = false;
					// Sin OpenTelemetry activo el meter es no-op.
					const meter = obtenerMeter();
					const atributos = { "scheduler.tarea": nombre, resultado };
					meter.createCounter("scheduler.ejecuciones").add(1, atributos);
					meter
						.createHistogram("scheduler.duracion", { unit: "s" })
						.record((performance.now() - inicio) / 1000, atributos);
				}
			}, cadaMs),
		);
	}

	detener(): void {
		for (const intervalo of this.intervalos) clearInterval(intervalo);
		this.intervalos = [];
	}
}
