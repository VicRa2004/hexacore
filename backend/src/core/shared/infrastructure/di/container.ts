import { env } from "@/core/config/env";
import { modules } from "@/modules";
import { NoopEventBus } from "../events/NoopEventBus";
import { PermitirAutenticadoGuard } from "../http/permisoGuard";
import { ConsoleMailer } from "../mail/ConsoleMailer";
import { ResendMailer } from "../mail/ResendMailer";
import { DependencyContainer } from "./DependencyContainer";
import { TOKENS } from "./tokens";

const container = new DependencyContainer();

// Infraestructura compartida; los módulos se registran después y pueden sobrescribirla.
container.set(TOKENS.EventBus, () => new NoopEventBus());
container.set(TOKENS.PermisoGuard, () => new PermitirAutenticadoGuard());
container.set(TOKENS.Mailer, () =>
	env.RESEND_API_KEY
		? new ResendMailer(env.RESEND_API_KEY, env.MAIL_FROM)
		: new ConsoleMailer(env.NODE_ENV === "prod"),
);

for (const module of modules) module.register?.(container);

export { container };
