import type { AppModule } from "@/core/shared/infrastructure/di/AppModule";
import { TOKENS } from "@/core/shared/infrastructure/di/tokens";
import { AUTH_TOKENS } from "@/modules/auth";
import { SendWelcomeEmail } from "./application/subscribers/SendWelcomeEmail";
import { CreateUserUseCase } from "./application/useCases/CreateUserUseCase";
import { DeleteUserUseCase } from "./application/useCases/DeleteUserUseCase";
import { GetAllUsersUseCase } from "./application/useCases/GetAllUsersUseCase";
import { GetOneUserUseCase } from "./application/useCases/GetOneUserUseCase";
import { UpdateUserUseCase } from "./application/useCases/UpdateUserUseCase";
import { UserController } from "./infrastructure/http/controllers/UserController";
import { UserRouter } from "./infrastructure/http/routes/UserRouter";
import { PrismaUserRepository } from "./infrastructure/repository/PrismaUserRepository";
import { BcryptPasswordHasherService } from "./infrastructure/service/BcryptPasswordHasherService";
import { USER_TOKENS } from "./infrastructure/tokens";

export const userModule: AppModule = {
	register(container) {
		container.set(USER_TOKENS.UserRepository, () => new PrismaUserRepository());
		container.set(
			USER_TOKENS.PasswordHasher,
			() => new BcryptPasswordHasherService(),
		);
		new SendWelcomeEmail(container.get(TOKENS.EventBus)).setupSubscription();
	},
	mount(app, container) {
		const users = container.get(USER_TOKENS.UserRepository);
		const hasher = container.get(USER_TOKENS.PasswordHasher);
		const eventBus = container.get(TOKENS.EventBus);

		const router = new UserRouter(
			container.get(AUTH_TOKENS.AuthMiddleware),
			container.get(TOKENS.PermissionGuard),
			new UserController({
				create: new CreateUserUseCase(users, hasher, eventBus),
				getAll: new GetAllUsersUseCase(users),
				getOne: new GetOneUserUseCase(users),
				update: new UpdateUserUseCase(users, hasher),
				delete: new DeleteUserUseCase(users),
			}),
		);
		app.route("/api/users", router.router);
	},
};
