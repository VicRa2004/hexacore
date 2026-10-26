import type { AppModule } from "@/core/shared/infrastructure/di/AppModule";
import { TOKENS } from "@/core/shared/infrastructure/di/tokens";
import { AUTH_TOKENS } from "@/modules/auth";
import { CreatePermissionUseCase } from "./application/useCases/CreatePermissionUseCase";
import { DeletePermissionUseCase } from "./application/useCases/DeletePermissionUseCase";
import { GetAllPermissionsUseCase } from "./application/useCases/GetAllPermissionsUseCase";
import { GetPermissionUseCase } from "./application/useCases/GetPermissionUseCase";
import { GetUserPermissionsUseCase } from "./application/useCases/GetUserPermissionsUseCase";
import { UpdatePermissionUseCase } from "./application/useCases/UpdatePermissionUseCase";
import { CreatePermissionController } from "./infrastructure/http/controllers/CreatePermissionController";
import { DeletePermissionController } from "./infrastructure/http/controllers/DeletePermissionController";
import { GetAllPermissionsController } from "./infrastructure/http/controllers/GetAllPermissionsController";
import { GetPermissionController } from "./infrastructure/http/controllers/GetPermissionController";
import { GetUserPermissionsController } from "./infrastructure/http/controllers/GetUserPermissionsController";
import { UpdatePermissionController } from "./infrastructure/http/controllers/UpdatePermissionController";
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
			new GetAllPermissionsController(new GetAllPermissionsUseCase(repo)),
			new GetPermissionController(new GetPermissionUseCase(repo)),
			new CreatePermissionController(new CreatePermissionUseCase(repo)),
			new UpdatePermissionController(new UpdatePermissionUseCase(repo)),
			new DeletePermissionController(new DeletePermissionUseCase(repo)),
			new GetUserPermissionsController(getUserPermissions),
		);
		app.route("/api/permissions", router.router);
	},
};
