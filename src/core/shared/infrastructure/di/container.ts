import { Lifecycle, container } from "tsyringe";

// Import implementations
import { PrismaUserRepository } from "@/core/user/infrastructure/repository/PrismaUserRepository";
import { BcryptPasswordHasherService } from "@/core/user/infrastructure/service/BcryptPasswordHasherService";
import { NodeEventBus } from "../events/NodeEventBus";
import { SendWelcomeEmail } from "@/core/user/application/subscribers/SendWelcomeEmail";
import { JwtService } from "@/modules/auth/infrastructure/service/JwtService";
import { PrismaAuthorizationRepository } from "@/modules/authorization/infrastructure/repository/PrismaAuthorizationRepository";

// Register Tokens
container.register("UserRepository", {
  useClass: PrismaUserRepository,
});

container.register("PasswordHasher", {
  useClass: BcryptPasswordHasherService,
});

container.register("JwtService", {
  useClass: JwtService,
});

container.register("AuthorizationRepository", {
  useClass: PrismaAuthorizationRepository,
});

container.register(
  "EventBus",
  {
    useClass: NodeEventBus,
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
