import swaggerJsDoc from "swagger-jsdoc";
import { env } from "./env";

const swaggerOptions: swaggerJsDoc.Options = {
	definition: {
		openapi: "3.0.0",
		info: {
			title: "Hexacore API",
			version: "1.0.0",
			description:
				"Documentación de la API de Hexacore - Arquitectura Hexagonal con Bun y Express",
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
		components: {
			securitySchemes: {
				bearerAuth: {
					type: "http",
					scheme: "bearer",
					bearerFormat: "JWT",
				},
			},
		},
		security: [
			{
				bearerAuth: [],
			},
		],
	},
	// Rutas donde se encuentran las anotaciones (puedes añadir más a medida que crees módulos)
	apis: [
		"./src/core/*/infrastructure/http/routes/*.ts",
		"./src/modules/*/infrastructure/http/routes/*.ts",
		"./src/core/*/infrastructure/http/controllers/*.ts",
		"./src/modules/*/infrastructure/http/controllers/*.ts",
	],
};

export const swaggerSpec = swaggerJsDoc(swaggerOptions);
