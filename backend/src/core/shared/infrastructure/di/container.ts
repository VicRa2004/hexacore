import { modules } from "@/modules";
import { NoopEventBus } from "../events/NoopEventBus";
import { PermitirAutenticadoGuard } from "../http/permisoGuard";
import { DependencyContainer } from "./DependencyContainer";
import { TOKENS } from "./tokens";

const container = new DependencyContainer();

// Infraestructura compartida; los módulos se registran después y pueden sobrescribirla.
container.set(TOKENS.EventBus, () => new NoopEventBus());
container.set(TOKENS.PermisoGuard, () => new PermitirAutenticadoGuard());

for (const module of modules) module.register?.(container);

export { container };
