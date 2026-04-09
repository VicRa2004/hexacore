import { container } from "tsyringe";

// Import implementations
import { PrismaUserRepository } from "@/modules/user/infrastructure/repository/PrismaUserRepository";
import { BcryptPasswordHasherService } from "@/modules/user/infrastructure/service/BcryptPasswordHasherService";

// Register Tokens
container.register("UserRepository", {
  useClass: PrismaUserRepository,
});

container.register("PasswordHasher", {
  useClass: BcryptPasswordHasherService,
});

export { container };
