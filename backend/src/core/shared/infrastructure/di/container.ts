import { Lifecycle, container } from "tsyringe";
import { TOKENS } from "@/core/shared/application/tokens";
import { modules } from "@/modules";
import { InMemoryEventBus } from "../events/InMemoryEventBus";
import { AllowAuthenticatedGuard } from "../http/permissionGuard";

// Infraestructura compartida; los módulos se registran después y pueden sobrescribirla.
container.register(
	TOKENS.EventBus,
	{
		useClass: InMemoryEventBus,
	},
	{ lifecycle: Lifecycle.Singleton },
);

container.register(TOKENS.PermissionGuard, {
	useClass: AllowAuthenticatedGuard,
});

for (const module of modules) module.register(container);

export { container };
