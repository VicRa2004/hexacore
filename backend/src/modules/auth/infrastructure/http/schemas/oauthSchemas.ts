import { z } from "@hono/zod-openapi";
import { PROVEEDORES_OAUTH } from "../../../domain/service/ProveedorOAuth";

const proveedorSchema = z.enum(PROVEEDORES_OAUTH).openapi("ProveedorOAuth");

export const proveedorParamSchema = z.object({ proveedor: proveedorSchema });

export const canjearOAuthSchema = z.object({
	codigo: z.string("El código es obligatorio").min(1).max(128),
});

export const callbackOAuthQuerySchema = z.object({
	code: z.string().optional(),
	state: z.string().optional(),
	error: z.string().optional(),
});

// ── Respuestas (sólo documentación OpenAPI) ──────────────────────────────────

export const proveedoresOAuthSchema = z
	.object({ proveedores: z.array(proveedorSchema) })
	.openapi("ProveedoresOAuth");

export const urlAutorizacionSchema = z
	.object({
		url: z.url().openapi({
			description: "Página de autorización del proveedor a la que navegar",
		}),
	})
	.openapi("UrlAutorizacionOAuth");

export const cuentaOAuthSchema = z
	.object({
		proveedor: proveedorSchema,
		email: z.string().nullable(),
		vinculadaEn: z.iso.datetime(),
	})
	.openapi("CuentaOAuth");
