import "reflect-metadata";
import { app } from "@/core/shared/infrastructure/http/server";
import { env } from "./core/config/env";
import { container } from "@/core/shared/infrastructure/di/container";
import { modules } from "@/modules";

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

for (const module of modules) module.onStart?.(container);
