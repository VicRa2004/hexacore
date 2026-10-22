import { env } from "./env";

/**
 * Metadatos del documento OpenAPI. Las rutas y schemas se generan desde los
 * schemas Zod que cada router registra en su `openAPIRegistry`.
 */
export const openApiConfig = {
	openapi: "3.0.0",
	info: {
		title: "Hexacore API",
		version: "1.0.0",
		description:
			"Documentación interactiva de la API de Hexacore generada con Scalar. Arquitectura hexagonal construida con Bun, Hono y PostgreSQL.",
		contact: {
			name: "Soporte",
		},
	},
	servers: [
		{
			url: `http://localhost:${env.PORT}`,
			description: "Servidor de Desarrollo",
		},
	],
	security: [{ bearerAuth: [] }],
};
