import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { Scalar } from "@scalar/hono-api-reference";
import { openApiSpec } from "@/core/config/swagger";

import { container } from "@/core/shared/infrastructure/di/container";
import { UserRouter } from "@/core/user/infrastructure/http/routes/UserRouter";
import { AuthRouter } from "@/modules/auth/infrastructure/http/routes/AuthRouter";
import { PermissionRouter } from "@/modules/authorization/infrastructure/http/routes/PermissionRouter";

const app = new Hono();

// 1. Middlewares Nativos (Reemplazan a helmet, morgan y cors)
app.use("*", secureHeaders());
app.use("*", cors());
app.use("*", logger());
// Nota: express.json() desaparece. Hono procesa el JSON automáticamente
// cuando llamas a c.req.json() en tus controladores.

// 2. Documentación de la API (Scalar)
app.get("/openapi.json", (c) => c.json(openApiSpec));
app.get("/api-docs.json", (c) => c.json(openApiSpec));
app.get(
	"/docs",
	Scalar({
		url: "/openapi.json",
		pageTitle: "Hexacore API Reference",
		theme: "purple",
	}),
);
app.get("/api-docs", (c) => c.redirect("/docs"));

// 3. Resolución de dependencias (TSyringe sigue intacto)
const userRouter = container.resolve(UserRouter);
const authRouter = container.resolve(AuthRouter);
const permissionRouter = container.resolve(PermissionRouter);

// 4. Registro de rutas
// En Hono se usa .route() en lugar de .use() para anidar otros routers
app.route("/api/user", userRouter.router);
app.route("/api/users", userRouter.router);
app.route("/api/auth", authRouter.router);
app.route("/api/permissions", permissionRouter.router);

// 5. Global Error Handler
app.onError((err, c) => {
	console.error(err);

	// Extraemos el status (forzando tipo de manera segura para Hono)
	const status = (err as any).status || 500;

	return c.json(
		{ error: err.message || "Internal Server Error" },
		status as any, // Casteo necesario porque Hono es muy estricto con los códigos HTTP (StatusCode)
	);
});

export { app };
