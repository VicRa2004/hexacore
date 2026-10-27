import { z } from "@hono/zod-openapi";

const errorResponseSchema = z
	.object({
		error: z.string().openapi({ example: "Mensaje descriptivo del error" }),
		details: z.unknown().optional().openapi({
			description: "Detalle de validación (sólo en errores 400 de Zod)",
		}),
		requestId: z.string().optional().openapi({
			description: "Id de la petición (sólo en errores 5xx), para reportarlo",
		}),
	})
	.openapi("ErrorResponse");

/** Respuesta JSON documentada con su schema Zod. */
export const jsonResponse = (schema: z.ZodType, description: string) => ({
	description,
	content: { "application/json": { schema } },
});

export const errorResponse = (description: string) =>
	jsonResponse(errorResponseSchema, description);

/** Respuestas de error comunes a las rutas con `authMiddleware` + `requierePermiso`. */
export const protectedErrorResponses = (permiso: string) => ({
	401: errorResponse("No autenticado"),
	403: errorResponse(`Permiso denegado (requiere ${permiso})`),
});
