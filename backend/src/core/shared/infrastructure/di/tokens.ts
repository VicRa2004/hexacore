import type { EventBus } from "@/core/shared/domain/events/EventBus";
import type { PermisoGuard } from "../http/permisoGuard";
import { token } from "./DependencyContainer";

/** Contratos compartidos con implementación por defecto en `container.ts`; un módulo puede sustituirlos. */
export const TOKENS = {
	EventBus: token<EventBus>("EventBus"),
	PermisoGuard: token<PermisoGuard>("PermisoGuard"),
} as const;
