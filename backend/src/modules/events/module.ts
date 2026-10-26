import type { AppModule } from "@/core/shared/infrastructure/di/AppModule";
import { TOKENS } from "@/core/shared/infrastructure/di/tokens";
import { InMemoryEventBus } from "./infrastructure/InMemoryEventBus";

/**
 * Opcional: sustituye el `NoopEventBus` del núcleo por un bus en memoria.
 * Quitarlo de `src/modules.ts` deja los eventos sin entregar, sin tocar casos de uso.
 */
export const eventsModule: AppModule = {
	register(container) {
		container.set(TOKENS.EventBus, () => new InMemoryEventBus());
	},
};
