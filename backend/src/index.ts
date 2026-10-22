import "reflect-metadata";
import { app } from "@/core/shared/infrastructure/http/server";
import { env } from "./core/config/env";
import { container } from "@/core/shared/infrastructure/di/container";
import { TOKENS } from "@/core/shared/application/tokens";
import type { RefreshTokenRepository } from "@/modules/auth/domain/repository/RefreshTokenRepository";

const server = Bun.serve({
	port: env.PORT,
	// En el contenedor hay que escuchar en todas las interfaces o el proxy no llega.
	hostname: env.NODE_ENV === "prod" ? "0.0.0.0" : "localhost",
	fetch: app.fetch,
});

console.log("-----------------------------------------");
console.log(`🚀 Server ready at: ${server.url}`);
console.log(`📡 Environment: ${env.NODE_ENV}`);
console.log("-----------------------------------------");

// Limpieza periódica de refresh tokens expirados (cada hora).
const refreshTokenRepo = container.resolve<RefreshTokenRepository>(
	TOKENS.RefreshTokenRepository,
);
setInterval(
	() => refreshTokenRepo.deleteExpired().catch(console.error),
	60 * 60 * 1000,
);
