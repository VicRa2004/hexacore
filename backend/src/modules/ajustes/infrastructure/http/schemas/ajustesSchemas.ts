import { z } from "@hono/zod-openapi";
import {
	colorMarcaSchema,
	nombreAppSchema,
	registroPublicoAbiertoSchema,
	remitenteCorreoSchema,
} from "../../../domain/AjustesConfig";

export const ajustesPublicosDtoSchema = z
	.object({
		nombreApp: z.string().openapi({ example: "Hexacore" }),
		colorMarca: z.number().int().min(0).max(360).openapi({ example: 277 }),
		registroPublicoAbierto: z.boolean().openapi({ example: true }),
		logoUrl: z.string().nullable().openapi({
			example: "/api/ajustes/logo?v=ajustes%2Flogo-123.png",
		}),
		faviconUrl: z.string().nullable().openapi({
			example: "/api/ajustes/favicon?v=ajustes%2Ffavicon-123.png",
		}),
	})
	.openapi("AjustesPublicosDto");

export const ajustesDtoSchema = ajustesPublicosDtoSchema
	.extend({
		remitenteCorreo: z
			.string()
			.openapi({ example: "Hexacore <no-reply@tu-dominio.com>" }),
	})
	.openapi("AjustesDto");

export const actualizarAjustesSchema = z
	.object({
		nombreApp: nombreAppSchema.optional(),
		colorMarca: colorMarcaSchema.optional(),
		remitenteCorreo: remitenteCorreoSchema.optional(),
		registroPublicoAbierto: registroPublicoAbiertoSchema.optional(),
	})
	.refine((datos) => Object.values(datos).some((v) => v !== undefined), {
		message: "Debes indicar al menos un ajuste para actualizar",
	})
	.openapi("ActualizarAjustesDto");
