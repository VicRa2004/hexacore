import type { AppModule } from "@/core/shared/infrastructure/di/AppModule";
import { TOKENS } from "@/core/shared/infrastructure/di/tokens";
import { OutboxEventBus } from "./infrastructure/OutboxEventBus";

const bus = new OutboxEventBus();

/**
 * Opcional, alternativa a `eventos`: sustituye el bus por uno con outbox en Postgres.
 * Los eventos se guardan en la misma transacción que los datos y se entregan
 * aunque el proceso caiga. Activar uno de los dos en `src/modules.ts`, no ambos.
 */
export const eventosOutboxModule: AppModule = {
	register(container) {
		container.set(TOKENS.EventBus, () => bus);
	},
	onStart(container) {
		const scheduler = container.get(TOKENS.Scheduler);
		scheduler.programar("eventos-outbox.despachar", 2000, async () => {
			// Vacía la cola en lotes antes de esperar al siguiente tick.
			while ((await bus.despacharPendientes()) > 0);
		});
		scheduler.programar("eventos-outbox.purgar", 24 * 60 * 60 * 1000, () =>
			bus.purgarProcesados(),
		);
		return undefined;
	},
};
