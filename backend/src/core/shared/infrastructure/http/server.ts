import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import type { MiddlewareHandler } from "hono";
import { logger } from "hono/logger";
import { requestId } from "hono/request-id";
import { secureHeaders } from "hono/secure-headers";
import { Scalar } from "@scalar/hono-api-reference";
import { openApiConfig } from "@/core/config/openapi";
import { env } from "@/core/config/env";
import { prisma } from "@/core/config/prisma";
import { serveStatic } from "hono/bun";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { existsSync } from "node:fs";
import path from "node:path";

import { container } from "@/core/shared/infrastructure/di/container";
import { modules } from "@/modules";

const app = new OpenAPIHono();
const isProd = env.NODE_ENV === "prod";

/** Una línea JSON por petición (prod): la recogen los logs de Dokploy tal cual. */
const jsonLogger: MiddlewareHandler = async (c, next) => {
	const start = performance.now();
	await next();
	console.log(
		JSON.stringify({
			level: "info",
			requestId: c.get("requestId"),
			method: c.req.method,
			path: c.req.path,
			status: c.res.status,
			ms: Math.round(performance.now() - start),
		}),
	);
};

// 1. Middlewares Nativos (Reemplazan a helmet, morgan y cors)
app.use("*", secureHeaders());
app.use("*", cors({ origin: env.CORS_ORIGIN }));
app.use("*", requestId());
app.use("*", isProd ? jsonLogger : logger());
// Nota: express.json() desaparece. Hono procesa el JSON automáticamente
// cuando llamas a c.req.json() en tus controladores.

// 2. Documentación de la API (Scalar)
// El documento se genera al pedirlo, con las rutas ya montadas en el paso 4.
app.openAPIRegistry.registerComponent("securitySchemes", "bearerAuth", {
	type: "http",
	scheme: "bearer",
	bearerFormat: "JWT",
	description: "Introduce el token JWT con formato Bearer <token>",
});
app.doc("/openapi.json", openApiConfig);
app.get("/api-docs.json", (c) => c.redirect("/openapi.json"));
app.get(
	"/docs",
	Scalar({
		url: "/openapi.json",
		pageTitle: "Hexacore API Reference",
		theme: "purple",
	}),
);
app.get("/api-docs", (c) => c.redirect("/docs"));

// Liveness: el proceso responde (sin BD, para no reiniciar el contenedor si cae Postgres).
app.get("/health", (c) => c.json({ status: "ok" }));
// Readiness: la BD responde.
app.get("/ready", async (c) => {
	try {
		await prisma.$queryRaw`SELECT 1`;
		return c.json({ status: "ok" });
	} catch {
		return c.json({ status: "unavailable" }, 503);
	}
});

// 3-4. Rutas de cada módulo activo (lista en src/modules.ts)
for (const module of modules) module.mount(app, container);

// 5. Global Error Handler
app.onError((err, c) => {
	const id = c.get("requestId");
	if (isProd) {
		console.error(
			JSON.stringify({
				level: "error",
				requestId: id,
				message: err.message,
				stack: err.stack,
			}),
		);
	} else {
		console.error(`[${id}]`, err);
	}

	let status: ContentfulStatusCode = 500;
	if (
		typeof err === "object" &&
		err !== null &&
		"status" in err &&
		typeof (err as { status: unknown }).status === "number"
	) {
		const parsedStatus = (err as { status: number }).status;
		if (parsedStatus >= 400 && parsedStatus <= 599) {
			status = parsedStatus as ContentfulStatusCode;
		}
	}

	// En los 5xx no se expone el mensaje interno (ya queda en el log), sí el id para reportarlo.
	return c.json(
		status >= 500
			? { error: "Internal Server Error", requestId: id }
			: { error: err.message },
		status,
	);
});

// 6. Servir Frontend en Producción (SPA)
const frontendDistPath = existsSync(
	path.resolve(process.cwd(), "frontend/dist"),
)
	? path.resolve(process.cwd(), "frontend/dist")
	: path.resolve(process.cwd(), "../frontend/dist");

if (
	(env.NODE_ENV === "prod" || process.env.SERVE_FRONTEND === "true") &&
	existsSync(frontendDistPath)
) {
	const relativeDist = path.relative(process.cwd(), frontendDistPath);

	// Servir archivos estáticos generados por Vite (assets, imágenes, etc.)
	app.use("/*", serveStatic({ root: relativeDist }));

	// Fallback para navegación SPA en rutas cliente
	app.get("*", async (c) => {
		const reqPath = c.req.path;
		if (
			reqPath.startsWith("/api") ||
			reqPath.startsWith("/docs") ||
			reqPath.startsWith("/openapi") ||
			reqPath.startsWith("/api-docs")
		) {
			return c.notFound();
		}

		const indexPath = path.join(frontendDistPath, "index.html");
		if (existsSync(indexPath)) {
			return new Response(Bun.file(indexPath), {
				headers: {
					"Content-Type": "text/html; charset=utf-8",
				},
			});
		}

		return c.notFound();
	});
}

export { app };
