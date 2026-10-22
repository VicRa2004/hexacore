import { Lifecycle, container } from "tsyringe";
import { TOKENS } from "@/core/shared/application/tokens";

// Import implementations
import { PrismaUserRepository } from "@/core/user/infrastructure/repository/PrismaUserRepository";
import { BcryptPasswordHasherService } from "@/core/user/infrastructure/service/BcryptPasswordHasherService";
import { InMemoryEventBus } from "../events/InMemoryEventBus";
import { SendWelcomeEmail } from "@/core/user/application/subscribers/SendWelcomeEmail";
import { JwtService } from "@/modules/auth/infrastructure/service/JwtService";
import { PrismaAuthorizationRepository } from "@/modules/authorization/infrastructure/repository/PrismaAuthorizationRepository";
import { AuthMiddleware } from "@/modules/auth/infrastructure/http/middlewares/authMiddleware";
import { RequirePermissionMiddleware } from "@/modules/authorization/infrastructure/http/middlewares/RequirePermissionMiddleware";
import { PrismaRefreshTokenRepository } from "@/modules/auth/infrastructure/repository/PrismaRefreshTokenRepository";

// Register Tokens
container.register(TOKENS.UserRepository, {
	useClass: PrismaUserRepository,
});

container.register(TOKENS.PasswordHasher, {
	useClass: BcryptPasswordHasherService,
});

container.register(TOKENS.TokenService, {
	useClass: JwtService,
});

container.register(TOKENS.AuthorizationRepository, {
	useClass: PrismaAuthorizationRepository,
});

container.register(TOKENS.AuthMiddleware, {
	useClass: AuthMiddleware,
});

container.register(TOKENS.RequirePermissionMiddleware, {
	useClass: RequirePermissionMiddleware,
});

container.register(TOKENS.RefreshTokenRepository, {
	useClass: PrismaRefreshTokenRepository,
});

container.register(
	TOKENS.EventBus,
	{
		useClass: InMemoryEventBus,
	},
	{ lifecycle: Lifecycle.Singleton },
);

function bootstrapSubscribers() {
	const welcomeEmailSubscriber = container.resolve(SendWelcomeEmail);
	welcomeEmailSubscriber.setupSubscription();

	console.log("✅ Suscriptores de eventos inicializados");
}

bootstrapSubscribers();

export { container };
