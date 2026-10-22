import type { AppModule } from "@/core/shared/infrastructure/di/AppModule";
import { TOKENS } from "@/core/shared/application/tokens";
import { SendWelcomeEmail } from "./application/subscribers/SendWelcomeEmail";
import { UserRouter } from "./infrastructure/http/routes/UserRouter";
import { PrismaUserRepository } from "./infrastructure/repository/PrismaUserRepository";
import { BcryptPasswordHasherService } from "./infrastructure/service/BcryptPasswordHasherService";

export const userModule: AppModule = {
	register(container) {
		container.register(TOKENS.UserRepository, {
			useClass: PrismaUserRepository,
		});
		container.register(TOKENS.PasswordHasher, {
			useClass: BcryptPasswordHasherService,
		});
		container.resolve(SendWelcomeEmail).setupSubscription();
	},
	mount(app, container) {
		app.route("/api/users", container.resolve(UserRouter).router);
	},
};
