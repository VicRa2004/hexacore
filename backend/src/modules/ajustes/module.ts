import { env } from "@/core/config/env";
import type { AppModule } from "@/core/shared/infrastructure/di/AppModule";
import { TOKENS } from "@/core/shared/infrastructure/di/tokens";
import { AUTH_TOKENS } from "@/modules/auth";
import { ServicioAjustes } from "./application/services/ServicioAjustes";
import { ActualizarAjustesUseCase } from "./application/useCases/ActualizarAjustesUseCase";
import { CambiarImagenAjusteUseCase } from "./application/useCases/CambiarImagenAjusteUseCase";
import { ObtenerAjustesPublicosUseCase } from "./application/useCases/ObtenerAjustesPublicosUseCase";
import { ObtenerAjustesUseCase } from "./application/useCases/ObtenerAjustesUseCase";
import { ObtenerImagenAjusteUseCase } from "./application/useCases/ObtenerImagenAjusteUseCase";
import { AjustesController } from "./infrastructure/http/controllers/AjustesController";
import { ImagenAjusteController } from "./infrastructure/http/controllers/ImagenAjusteController";
import { AjustesRouter } from "./infrastructure/http/routes/AjustesRouter";
import { PrismaAjusteRepository } from "./infrastructure/repository/PrismaAjusteRepository";

const repo = new PrismaAjusteRepository();

export const ajustesModule: AppModule = {
	register(container) {
		container.set(
			TOKENS.LectorAjustes,
			() => new ServicioAjustes(repo, env.MAIL_FROM),
		);
	},
	mount(app, container) {
		const lector = container.get(TOKENS.LectorAjustes);
		const eventBus = container.get(TOKENS.EventBus);
		const uow = container.get(TOKENS.UnitOfWork);
		const almacenamiento = container.get(TOKENS.Almacenamiento);

		const router = new AjustesRouter(
			container.get(AUTH_TOKENS.AuthMiddleware),
			container.get(TOKENS.PermisoGuard),
			new AjustesController({
				obtenerPublicos: new ObtenerAjustesPublicosUseCase(lector),
				obtener: new ObtenerAjustesUseCase(lector),
				actualizar: new ActualizarAjustesUseCase(repo, lector, eventBus, uow),
			}),
			new ImagenAjusteController({
				obtener: new ObtenerImagenAjusteUseCase(lector, almacenamiento),
				cambiar: new CambiarImagenAjusteUseCase(
					repo,
					lector,
					almacenamiento,
					eventBus,
					uow,
				),
			}),
		);
		app.route("/api/ajustes", router.router);
	},
};
