import type { AppModule } from "@/core/shared/infrastructure/di/AppModule";
import { USER_TOKENS } from "@/core/user";
import { SessionIssuer } from "./application/services/SessionIssuer";
import { LoginUseCase } from "./application/useCases/LoginUseCase";
import { LogoutUseCase } from "./application/useCases/LogoutUseCase";
import { RefreshTokenUseCase } from "./application/useCases/RefreshTokenUseCase";
import { RegisterUseCase } from "./application/useCases/RegisterUseCase";
import { LoginController } from "./infrastructure/http/controllers/LoginController";
import { LogoutController } from "./infrastructure/http/controllers/LogoutController";
import { RefreshTokenController } from "./infrastructure/http/controllers/RefreshTokenController";
import { RegisterController } from "./infrastructure/http/controllers/RegisterController";
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
		const users = container.get(USER_TOKENS.UserRepository);
		const hasher = container.get(USER_TOKENS.PasswordHasher);
		const sessions = new SessionIssuer(tokenService, refreshTokenRepo);

		const router = new AuthRouter(
			new LoginController(new LoginUseCase(users, hasher, sessions)),
			new RegisterController(new RegisterUseCase(users, hasher, sessions)),
			new RefreshTokenController(
				new RefreshTokenUseCase(
					tokenService,
					refreshTokenRepo,
					users,
					sessions,
				),
			),
			new LogoutController(new LogoutUseCase(tokenService, refreshTokenRepo)),
		);
		app.route("/api/auth", router.router);
	},
	onStart() {
		// Limpieza periódica de refresh tokens expirados (cada hora).
		const interval = setInterval(
			() => refreshTokenRepo.deleteExpired().catch(console.error),
			60 * 60 * 1000,
		);
		return () => clearInterval(interval);
	},
};
