import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { Scalar } from "@scalar/hono-api-reference";
import { openApiConfig } from "@/core/config/openapi";
import { env } from "@/core/config/env";
import { serveStatic } from "hono/bun";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { existsSync } from "node:fs";
import path from "node:path";

import { container } from "@/core/shared/infrastructure/di/container";
import { modules } from "@/modules";

const app = new OpenAPIHono();

// 1. Middlewares Nativos (Reemplazan a helmet, morgan y cors)
app.use("*", secureHeaders());
app.use("*", cors({ origin: env.CORS_ORIGIN }));
app.use("*", logger());
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

app.get("/health", (c) => c.json({ status: "ok" }));

// 3-4. Rutas de cada módulo activo (lista en src/modules.ts)
for (const module of modules) module.mount(app, container);

// 5. Global Error Handler
app.onError((err, c) => {
	console.error(err);

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

	// En los 5xx no se expone el mensaje interno (ya queda en el log).
	return c.json(
		{ error: status >= 500 ? "Internal Server Error" : err.message },
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
