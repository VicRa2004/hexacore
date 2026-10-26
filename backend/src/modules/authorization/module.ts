import type { AppModule } from "@/core/shared/infrastructure/di/AppModule";
import { TOKENS } from "@/core/shared/infrastructure/di/tokens";
import { AUTH_TOKENS } from "@/modules/auth";
import { CreatePermissionUseCase } from "./application/useCases/CreatePermissionUseCase";
import { DeletePermissionUseCase } from "./application/useCases/DeletePermissionUseCase";
import { GetAllPermissionsUseCase } from "./application/useCases/GetAllPermissionsUseCase";
import { GetPermissionUseCase } from "./application/useCases/GetPermissionUseCase";
import { GetUserPermissionsUseCase } from "./application/useCases/GetUserPermissionsUseCase";
import { UpdatePermissionUseCase } from "./application/useCases/UpdatePermissionUseCase";
import { PermissionController } from "./infrastructure/http/controllers/PermissionController";
import { RequirePermissionMiddleware } from "./infrastructure/http/middlewares/RequirePermissionMiddleware";
import { PermissionRouter } from "./infrastructure/http/routes/PermissionRouter";
import { PrismaAuthorizationRepository } from "./infrastructure/repository/PrismaAuthorizationRepository";

// Interno del módulo: no se comparte, así que no pasa por el contenedor.
const repo = new PrismaAuthorizationRepository();
const getUserPermissions = new GetUserPermissionsUseCase(repo);

export const authorizationModule: AppModule = {
	register(container) {
		// Sustituye al guard por defecto del núcleo (solo autenticado).
		container.set(
			TOKENS.PermissionGuard,
			() => new RequirePermissionMiddleware(getUserPermissions),
		);
	},
	mount(app, container) {
		const router = new PermissionRouter(
			container.get(AUTH_TOKENS.AuthMiddleware),
			container.get(TOKENS.PermissionGuard),
			new PermissionController({
				getAll: new GetAllPermissionsUseCase(repo),
				getOne: new GetPermissionUseCase(repo),
				create: new CreatePermissionUseCase(repo),
				update: new UpdatePermissionUseCase(repo),
				delete: new DeletePermissionUseCase(repo),
				getByUser: getUserPermissions,
			}),
		);
		app.route("/api/permissions", router.router);
	},
};
