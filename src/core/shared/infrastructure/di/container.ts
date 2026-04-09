import { createContainer, asClass, InjectionMode } from "awilix";
import { NodeEventBus } from "../events/NodeEventBus";

const container = createContainer({
  injectionMode: InjectionMode.PROXY,
});

container.loadModules(
  [
    // Buscar repositorios, casos de uso, servicios, listeners y controladores
    // Soportar tanto .ts (dev) como .js (build) para evitar problemas en producción
    "../../../../modules/**/infrastructure/**/*Repository.{ts,js}",
    "../../../../modules/**/application/**/*UseCase.{ts,js}",
    "../../../../modules/**/infrastructure/**/*Service.{ts,js}",
    "../../../../modules/**/application/**/*Service.{ts,js}",
    "../../../../modules/**/infrastructure/**/*Listener.{ts,js}",
    "../../../../modules/**/infrastructure/**/*Controller.{ts,js}",
    "../../../../modules/**/infrastructure/**/*Handler.{ts,js}",
  ],
  {
    cwd: __dirname,
    formatName: "camelCase", // ej: PrismaUserRepository se registra como prismaUserRepository
    resolverOptions: {
      register: asClass,
    },
  },
);

// Registramos el EventBus manualmente como SINGLETON
container.register({
  eventBus: asClass(NodeEventBus).singleton(),
});

export { container };
