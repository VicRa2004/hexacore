import type { AppModule } from "@/core/shared/infrastructure/di/AppModule";
import { userModule } from "@/core/user/module";
import { authModule } from "@/modules/auth/module";
import { authorizationModule } from "@/modules/authorization/module";

/**
 * Módulos activos, en orden de registro. Añadir o quitar un módulo = tocar esta lista
 * (checklist completa en `backend/AGENTS.md`, "Cómo quitar un módulo").
 */
export const modules: AppModule[] = [
	userModule,
	authModule,
	authorizationModule,
];
