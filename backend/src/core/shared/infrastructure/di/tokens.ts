import type { Almacenamiento } from "@/core/shared/domain/Almacenamiento";
import type { EventBus } from "@/core/shared/domain/events/EventBus";
import type { Mailer } from "@/core/shared/domain/Mailer";
import type { Scheduler } from "@/core/shared/domain/Scheduler";
import type { UnitOfWork } from "@/core/shared/domain/UnitOfWork";
import type { PermisoGuard } from "../http/permisoGuard";
import { token } from "./DependencyContainer";

/** Contratos compartidos con implementación por defecto en `container.ts`; un módulo puede sustituirlos. */
export const TOKENS = {
	EventBus: token<EventBus>("EventBus"),
	PermisoGuard: token<PermisoGuard>("PermisoGuard"),
	Mailer: token<Mailer>("Mailer"),
	Scheduler: token<Scheduler>("Scheduler"),
	UnitOfWork: token<UnitOfWork>("UnitOfWork"),
	Almacenamiento: token<Almacenamiento>("Almacenamiento"),
} as const;
