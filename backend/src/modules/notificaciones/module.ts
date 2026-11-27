import type { AppModule } from "@/core/shared/infrastructure/di/AppModule";
import { TOKENS } from "@/core/shared/infrastructure/di/tokens";
import { AUTH_TOKENS } from "@/modules/auth";
import { RegistrarNotificaciones } from "./application/subscribers/RegistrarNotificaciones";
import { ListarNotificacionesUseCase } from "./application/useCases/ListarNotificacionesUseCase";
import { MarcarNotificacionLeidaUseCase } from "./application/useCases/MarcarNotificacionLeidaUseCase";
import { MarcarTodasLeidasUseCase } from "./application/useCases/MarcarTodasLeidasUseCase";
import { PurgarNotificacionesAntiguasUseCase } from "./application/useCases/PurgarNotificacionesAntiguasUseCase";
import { NotificacionController } from "./infrastructure/http/controllers/NotificacionController";
import { NotificacionRouter } from "./infrastructure/http/routes/NotificacionRouter";
import { PrismaNotificacionRepository } from "./infrastructure/repository/PrismaNotificacionRepository";

const repo = new PrismaNotificacionRepository();
const purgarAntiguas = new PurgarNotificacionesAntiguasUseCase(repo);

/**
 * Opcional: guarda notificaciones dentro de la app a partir de eventos de dominio
 * y expone `GET/PATCH /api/notificaciones`. Necesita `eventos` o `eventos-outbox`.
 */
export const notificacionesModule: AppModule = {
	mount(app, container) {
		const eventBus = container.get(TOKENS.EventBus);
		new RegistrarNotificaciones(eventBus, repo).suscribir();

		const router = new NotificacionRouter(
			container.get(AUTH_TOKENS.AuthMiddleware),
			new NotificacionController({
				listar: new ListarNotificacionesUseCase(repo),
				marcarLeida: new MarcarNotificacionLeidaUseCase(repo),
				marcarTodasLeidas: new MarcarTodasLeidasUseCase(repo),
			}),
		);
		app.route("/api/notificaciones", router.router);
	},
	onStart(container) {
		container
			.get(TOKENS.Scheduler)
			.programar("notificaciones.purgar", 24 * 60 * 60 * 1000, async () => {
				await purgarAntiguas.ejecutar();
			});
		return undefined;
	},
};
