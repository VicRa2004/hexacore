import type { AppModule } from "@/core/shared/infrastructure/di/AppModule";
import { AUTH_TOKENS } from "./application/tokens";
import type { RefreshTokenRepository } from "./domain/repository/RefreshTokenRepository";
import { AuthMiddleware } from "./infrastructure/http/middlewares/authMiddleware";
import { AuthRouter } from "./infrastructure/http/routes/AuthRouter";
import { PrismaRefreshTokenRepository } from "./infrastructure/repository/PrismaRefreshTokenRepository";
import { JwtService } from "./infrastructure/service/JwtService";

export const authModule: AppModule = {
	register(container) {
		container.register(AUTH_TOKENS.TokenService, { useClass: JwtService });
		container.register(AUTH_TOKENS.RefreshTokenRepository, {
			useClass: PrismaRefreshTokenRepository,
		});
		container.register(AUTH_TOKENS.AuthMiddleware, {
			useClass: AuthMiddleware,
		});
	},
	mount(app, container) {
		app.route("/api/auth", container.resolve(AuthRouter).router);
	},
	onStart(container) {
		// Limpieza periódica de refresh tokens expirados (cada hora).
		const refreshTokenRepo = container.resolve<RefreshTokenRepository>(
			AUTH_TOKENS.RefreshTokenRepository,
		);
		setInterval(
			() => refreshTokenRepo.deleteExpired().catch(console.error),
			60 * 60 * 1000,
		);
	},
};
