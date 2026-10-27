import type { AppModule } from "@/core/shared/infrastructure/di/AppModule";
import { TOKENS } from "@/core/shared/infrastructure/di/tokens";
import { AUTH_TOKENS } from "@/modules/auth";
import { CrearPermisoUseCase } from "./application/useCases/CrearPermisoUseCase";
import { EliminarPermisoUseCase } from "./application/useCases/EliminarPermisoUseCase";
import { ObtenerPermisosUseCase } from "./application/useCases/ObtenerPermisosUseCase";
import { ObtenerPermisoUseCase } from "./application/useCases/ObtenerPermisoUseCase";
import { ObtenerPermisosUsuarioUseCase } from "./application/useCases/ObtenerPermisosUsuarioUseCase";
import { ActualizarPermisoUseCase } from "./application/useCases/ActualizarPermisoUseCase";
import { PermisoController } from "./infrastructure/http/controllers/PermisoController";
import { RequierePermisoMiddleware } from "./infrastructure/http/middlewares/RequierePermisoMiddleware";
import { PermisoRouter } from "./infrastructure/http/routes/PermisoRouter";
import { PrismaAutorizacionRepository } from "./infrastructure/repository/PrismaAutorizacionRepository";

// Interno del módulo: no se comparte, así que no pasa por el contenedor.
const repo = new PrismaAutorizacionRepository();
const obtenerPermisosUsuario = new ObtenerPermisosUsuarioUseCase(repo);

export const autorizacionModule: AppModule = {
	register(container) {
		// Sustituye al guard por defecto del núcleo (solo autenticado).
		container.set(
			TOKENS.PermisoGuard,
			() => new RequierePermisoMiddleware(obtenerPermisosUsuario),
		);
	},
	mount(app, container) {
		const router = new PermisoRouter(
			container.get(AUTH_TOKENS.AuthMiddleware),
			container.get(TOKENS.PermisoGuard),
			new PermisoController({
				obtenerTodos: new ObtenerPermisosUseCase(repo),
				obtenerUno: new ObtenerPermisoUseCase(repo),
				crear: new CrearPermisoUseCase(repo),
				actualizar: new ActualizarPermisoUseCase(repo),
				eliminar: new EliminarPermisoUseCase(repo),
				obtenerPorUsuario: obtenerPermisosUsuario,
			}),
		);
		app.route("/api/permisos", router.router);
	},
};
