import type { Scheduler } from "@/core/shared/domain/Scheduler";
import { log } from "../logger";

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
				try {
					await tarea();
				} catch (error) {
					log.error(`Falló la tarea "${nombre}"`, { error: String(error) });
				} finally {
					enCurso = false;
				}
			}, cadaMs),
		);
	}

	detener(): void {
		for (const intervalo of this.intervalos) clearInterval(intervalo);
		this.intervalos = [];
	}
}
