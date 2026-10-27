import type { AppModule } from "@/core/shared/infrastructure/di/AppModule";
import { USUARIO_TOKENS } from "@/core/usuario";
import { EmisorSesion } from "./application/services/EmisorSesion";
import { LoginUseCase } from "./application/useCases/LoginUseCase";
import { LogoutUseCase } from "./application/useCases/LogoutUseCase";
import { RefreshTokenUseCase } from "./application/useCases/RefreshTokenUseCase";
import { RegistroUseCase } from "./application/useCases/RegistroUseCase";
import { LoginController } from "./infrastructure/http/controllers/LoginController";
import { LogoutController } from "./infrastructure/http/controllers/LogoutController";
import { RefreshTokenController } from "./infrastructure/http/controllers/RefreshTokenController";
import { RegistroController } from "./infrastructure/http/controllers/RegistroController";
import { AuthMiddleware } from "./infrastructure/http/middlewares/authMiddleware";
import { AuthRouter } from "./infrastructure/http/routes/AuthRouter";
import { PrismaRefreshTokenRepository } from "./infrastructure/repository/PrismaRefreshTokenRepository";
import { JwtService } from "./infrastructure/service/JwtService";
import { AUTH_TOKENS } from "./infrastructure/tokens";

// Internos del módulo: no se comparten, así que no pasan por el contenedor.
const tokenService = new JwtService();
const refreshTokenRepo = new PrismaRefreshTokenRepository();

export const authModule: AppModule = {
	register(container) {
		container.set(
			AUTH_TOKENS.AuthMiddleware,
			() => new AuthMiddleware(tokenService),
		);
	},
	mount(app, container) {
		const usuarios = container.get(USUARIO_TOKENS.UsuarioRepository);
		const hasher = container.get(USUARIO_TOKENS.PasswordHasher);
		const sesiones = new EmisorSesion(tokenService, refreshTokenRepo);

		const router = new AuthRouter(
			new LoginController(new LoginUseCase(usuarios, hasher, sesiones)),
			new RegistroController(new RegistroUseCase(usuarios, hasher, sesiones)),
			new RefreshTokenController(
				new RefreshTokenUseCase(
					tokenService,
					refreshTokenRepo,
					usuarios,
					sesiones,
				),
			),
			new LogoutController(new LogoutUseCase(tokenService, refreshTokenRepo)),
		);
		app.route("/api/auth", router.router);
	},
	onStart() {
		// Limpieza periódica de refresh tokens expirados (cada hora).
		const intervalo = setInterval(
			() => refreshTokenRepo.eliminarExpirados().catch(console.error),
			60 * 60 * 1000,
		);
		return () => clearInterval(intervalo);
	},
};
