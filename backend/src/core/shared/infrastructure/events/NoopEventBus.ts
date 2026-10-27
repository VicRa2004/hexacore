import type { EventBus } from "../../domain/events/EventBus";

/**
 * Bus por defecto sin el módulo `eventos`: publicar no hace nada y nadie recibe.
 * Así los casos de uso publican igual, esté o no el módulo instalado.
 */
export class NoopEventBus implements EventBus {
	async publish(): Promise<void> {}
	async publishAll(): Promise<void> {}
	subscribe(): void {}
}
