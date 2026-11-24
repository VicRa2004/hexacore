import type { AppModule } from "@/core/shared/infrastructure/di/AppModule";
import { TOKENS } from "@/core/shared/infrastructure/di/tokens";
import { AUTH_TOKENS } from "@/modules/auth";
import { RegistrarAuditoria } from "./application/subscribers/RegistrarAuditoria";
import { ExportarAuditoriaUseCase } from "./application/useCases/ExportarAuditoriaUseCase";
import { ObtenerAuditoriaUseCase } from "./application/useCases/ObtenerAuditoriaUseCase";
import { AuditoriaController } from "./infrastructure/http/controllers/AuditoriaController";
import { AuditoriaRouter } from "./infrastructure/http/routes/AuditoriaRouter";
import { PrismaAuditoriaRepository } from "./infrastructure/repository/PrismaAuditoriaRepository";

/**
 * Opcional: guarda todos los eventos de dominio en la tabla `auditoria` y expone
 * `GET /api/auditoria`. Necesita un bus real (`eventos` o `eventos-outbox`).
 */
export const auditoriaModule: AppModule = {
	mount(app, container) {
		const repo = new PrismaAuditoriaRepository();
		const eventBus = container.get(TOKENS.EventBus);
		new RegistrarAuditoria(eventBus, repo).suscribir();

		const router = new AuditoriaRouter(
			container.get(AUTH_TOKENS.AuthMiddleware),
			container.get(TOKENS.PermisoGuard),
			new AuditoriaController({
				obtenerAuditoria: new ObtenerAuditoriaUseCase(repo),
				exportarAuditoria: new ExportarAuditoriaUseCase(repo, eventBus),
			}),
		);
		app.route("/api/auditoria", router.router);
	},
};
