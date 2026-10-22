import type { AppModule } from "@/core/shared/infrastructure/di/AppModule";
import { TOKENS } from "@/core/shared/application/tokens";
import { AUTHORIZATION_TOKENS } from "./application/tokens";
import { RequirePermissionMiddleware } from "./infrastructure/http/middlewares/RequirePermissionMiddleware";
import { PermissionRouter } from "./infrastructure/http/routes/PermissionRouter";
import { PrismaAuthorizationRepository } from "./infrastructure/repository/PrismaAuthorizationRepository";

export const authorizationModule: AppModule = {
	register(container) {
		container.register(AUTHORIZATION_TOKENS.AuthorizationRepository, {
			useClass: PrismaAuthorizationRepository,
		});
		// Sustituye al guard por defecto del núcleo (solo autenticado).
		container.register(TOKENS.PermissionGuard, {
			useClass: RequirePermissionMiddleware,
		});
	},
	mount(app, container) {
		app.route("/api/permissions", container.resolve(PermissionRouter).router);
	},
};
