import type { AppModule } from "@/core/shared/infrastructure/di/AppModule";
import { usuarioModule } from "@/core/usuario/module";
import { authModule } from "@/modules/auth/module";
import { autorizacionModule } from "@/modules/autorizacion/module";
import { eventosModule } from "@/modules/eventos/module";

/**
 * Módulos activos, en orden de registro. Añadir o quitar un módulo = tocar esta lista
 * (checklist completa en `backend/AGENTS.md`, "Cómo quitar un módulo").
 */
export const modules: AppModule[] = [
	usuarioModule,
	authModule,
	autorizacionModule,
	eventosModule,
];
