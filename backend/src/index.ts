import "reflect-metadata";
import { app } from "@/core/shared/infrastructure/http/server";
import { env } from "./core/config/env";
import { prisma } from "@/core/config/prisma";
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

const stopTasks = modules.map((module) => module.onStart?.(container));

// Apagado ordenado (Dokploy manda SIGTERM en cada deploy): deja de aceptar
// conexiones, espera a las peticiones en vuelo y cierra la BD.
const shutdown = async (signal: string) => {
	console.log(`${signal} recibido, apagando...`);
	await server.stop();
	for (const stop of stopTasks) stop?.();
	await prisma.$disconnect();
	process.exit(0);
};
process.once("SIGTERM", shutdown);
process.once("SIGINT", shutdown);
