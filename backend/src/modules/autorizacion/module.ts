import type { AppModule } from "@/core/shared/infrastructure/di/AppModule";
import { TOKENS } from "@/core/shared/infrastructure/di/tokens";
import { AUTH_TOKENS } from "@/modules/auth";
import { CrearPermisoUseCase } from "./application/useCases/CrearPermisoUseCase";
import { EliminarPermisoUseCase } from "./application/useCases/EliminarPermisoUseCase";
import { ObtenerPermisosUseCase } from "./application/useCases/ObtenerPermisosUseCase";
import { ObtenerPermisoUseCase } from "./application/useCases/ObtenerPermisoUseCase";
import { ObtenerPermisosUsuarioUseCase } from "./application/useCases/ObtenerPermisosUsuarioUseCase";
import { ActualizarPermisoUseCase } from "./application/useCases/ActualizarPermisoUseCase";
import { ActualizarAsignacionUsuarioUseCase } from "./application/useCases/ActualizarAsignacionUsuarioUseCase";
import { ActualizarRolUseCase } from "./application/useCases/ActualizarRolUseCase";
import { CrearRolUseCase } from "./application/useCases/CrearRolUseCase";
import { EliminarRolUseCase } from "./application/useCases/EliminarRolUseCase";
import { ObtenerAsignacionUsuarioUseCase } from "./application/useCases/ObtenerAsignacionUsuarioUseCase";
import { ObtenerRolesUseCase } from "./application/useCases/ObtenerRolesUseCase";
import { ObtenerRolUseCase } from "./application/useCases/ObtenerRolUseCase";
import { AsignacionController } from "./infrastructure/http/controllers/AsignacionController";
import { RolController } from "./infrastructure/http/controllers/RolController";
import { PermisoController } from "./infrastructure/http/controllers/PermisoController";
import { RequierePermisoMiddleware } from "./infrastructure/http/middlewares/RequierePermisoMiddleware";
import { AsignacionRouter } from "./infrastructure/http/routes/AsignacionRouter";
import { PermisoRouter } from "./infrastructure/http/routes/PermisoRouter";
import { RolRouter } from "./infrastructure/http/routes/RolRouter";
import { PrismaAutorizacionRepository } from "./infrastructure/repository/PrismaAutorizacionRepository";
import { PrismaRolRepository } from "./infrastructure/repository/PrismaRolRepository";

// Internos del módulo: no se comparten, así que no pasan por el contenedor.
const repo = new PrismaAutorizacionRepository();
const rolRepo = new PrismaRolRepository();
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
		const auth = container.get(AUTH_TOKENS.AuthMiddleware);
		const guard = container.get(TOKENS.PermisoGuard);

		const router = new PermisoRouter(
			auth,
			guard,
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

		const rolRouter = new RolRouter(
			auth,
			guard,
			new RolController({
				obtenerTodos: new ObtenerRolesUseCase(rolRepo),
				obtenerUno: new ObtenerRolUseCase(rolRepo),
				crear: new CrearRolUseCase(rolRepo),
				actualizar: new ActualizarRolUseCase(rolRepo),
				eliminar: new EliminarRolUseCase(rolRepo),
			}),
		);
		app.route("/api/roles", rolRouter.router);

		const asignacionRouter = new AsignacionRouter(
			auth,
			guard,
			new AsignacionController({
				obtener: new ObtenerAsignacionUsuarioUseCase(rolRepo),
				actualizar: new ActualizarAsignacionUsuarioUseCase(rolRepo),
			}),
		);
		app.route("/api/asignaciones", asignacionRouter.router);
	},
};
