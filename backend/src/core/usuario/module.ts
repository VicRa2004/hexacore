import type { AppModule } from "@/core/shared/infrastructure/di/AppModule";
import { TOKENS } from "@/core/shared/infrastructure/di/tokens";
import { AUTH_TOKENS } from "@/modules/auth";
import { EnviarEmailBienvenida } from "./application/subscribers/EnviarEmailBienvenida";
import { CambiarAvatarUseCase } from "./application/useCases/CambiarAvatarUseCase";
import { CrearUsuarioUseCase } from "./application/useCases/CrearUsuarioUseCase";
import { EliminarUsuarioUseCase } from "./application/useCases/EliminarUsuarioUseCase";
import { ObtenerAvatarUseCase } from "./application/useCases/ObtenerAvatarUseCase";
import { ObtenerUsuariosUseCase } from "./application/useCases/ObtenerUsuariosUseCase";
import { ObtenerUsuarioUseCase } from "./application/useCases/ObtenerUsuarioUseCase";
import { ActualizarUsuarioUseCase } from "./application/useCases/ActualizarUsuarioUseCase";
import { AvatarController } from "./infrastructure/http/controllers/AvatarController";
import { UsuarioController } from "./infrastructure/http/controllers/UsuarioController";
import { AvatarRouter } from "./infrastructure/http/routes/AvatarRouter";
import { UsuarioRouter } from "./infrastructure/http/routes/UsuarioRouter";
import { PrismaUsuarioRepository } from "./infrastructure/repository/PrismaUsuarioRepository";
import { BcryptPasswordHasherService } from "./infrastructure/service/BcryptPasswordHasherService";
import { USUARIO_TOKENS } from "./infrastructure/tokens";

export const usuarioModule: AppModule = {
	register(container) {
		container.set(
			USUARIO_TOKENS.UsuarioRepository,
			() => new PrismaUsuarioRepository(),
		);
		container.set(
			USUARIO_TOKENS.PasswordHasher,
			() => new BcryptPasswordHasherService(),
		);
	},
	mount(app, container) {
		const usuarios = container.get(USUARIO_TOKENS.UsuarioRepository);
		const hasher = container.get(USUARIO_TOKENS.PasswordHasher);
		// En mount y no en register: el bus real lo registra el módulo `eventos`, que puede ir después.
		const eventBus = container.get(TOKENS.EventBus);
		const uow = container.get(TOKENS.UnitOfWork);
		new EnviarEmailBienvenida(eventBus).suscribir();

		const router = new UsuarioRouter(
			container.get(AUTH_TOKENS.AuthMiddleware),
			container.get(TOKENS.PermisoGuard),
			new UsuarioController({
				crear: new CrearUsuarioUseCase(usuarios, hasher, eventBus, uow),
				obtenerTodos: new ObtenerUsuariosUseCase(usuarios),
				obtenerUno: new ObtenerUsuarioUseCase(usuarios),
				actualizar: new ActualizarUsuarioUseCase(
					usuarios,
					hasher,
					eventBus,
					uow,
				),
				eliminar: new EliminarUsuarioUseCase(usuarios, eventBus, uow),
			}),
		);
		app.route("/api/usuarios", router.router);

		const almacenamiento = container.get(TOKENS.Almacenamiento);
		const avatares = new AvatarRouter(
			container.get(AUTH_TOKENS.AuthMiddleware),
			new AvatarController({
				cambiar: new CambiarAvatarUseCase(
					usuarios,
					almacenamiento,
					eventBus,
					uow,
				),
				obtener: new ObtenerAvatarUseCase(usuarios, almacenamiento),
			}),
		);
		app.route("/api/avatares", avatares.router);
	},
};
