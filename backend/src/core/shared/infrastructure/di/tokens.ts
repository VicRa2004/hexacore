import type { EventBus } from "@/core/shared/domain/events/EventBus";
import type { PermissionGuard } from "../http/permissionGuard";
import { token } from "./DependencyContainer";

/** Contratos compartidos con implementación por defecto en `container.ts`; un módulo puede sustituirlos. */
export const TOKENS = {
	EventBus: token<EventBus>("EventBus"),
	PermissionGuard: token<PermissionGuard>("PermissionGuard"),
} as const;
