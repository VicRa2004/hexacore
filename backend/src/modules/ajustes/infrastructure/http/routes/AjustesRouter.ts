import { OpenAPIHono, z } from "@hono/zod-openapi";
import { bodyLimit } from "hono/body-limit";
import {
	errorResponse,
	jsonResponse,
	protectedErrorResponses,
} from "@/core/shared/infrastructure/http/openapi";
import type { PermisoGuard } from "@/core/shared/infrastructure/http/permisoGuard";
import type { AuthMiddleware } from "@/modules/auth";
import type { TipoImagenAjuste } from "../../../application/dtos/AjustesDto";
import { IMAGEN_AJUSTE_MAX_BYTES } from "../../../application/useCases/CambiarImagenAjusteUseCase";
import type { AjustesController } from "../controllers/AjustesController";
import type { ImagenAjusteController } from "../controllers/ImagenAjusteController";
import {
	actualizarAjustesSchema,
	ajustesDtoSchema,
	ajustesPublicosDtoSchema,
} from "../schemas/ajustesSchemas";

const tags = ["Ajustes"];
const security = [{ bearerAuth: [] }];

export class AjustesRouter {
	public readonly router = new OpenAPIHono();

	constructor(
		authMiddleware: AuthMiddleware,
		requierePermiso: PermisoGuard,
		controller: AjustesController,
		imagenController: ImagenAjusteController,
	) {
		const docs = this.router.openAPIRegistry;

		docs.registerPath({
			method: "get",
			path: "/publicos",
			tags,
			security: [],
			summary:
				"Ajustes públicos de marca y acceso (nombre, logo, favicon, color y registro abierto)",
			responses: {
				200: jsonResponse(ajustesPublicosDtoSchema, "Ajustes públicos"),
			},
		});
		this.router.get("/publicos", controller.obtenerPublicos);

		docs.registerPath({
			method: "get",
			path: "/",
			tags,
			security,
			summary: "Obtener todos los ajustes del sistema",
			responses: {
				200: jsonResponse(ajustesDtoSchema, "Ajustes completos"),
				...protectedErrorResponses("ajustes:leer"),
			},
		});
		this.router.get(
			"/",
			authMiddleware.handle,
			requierePermiso.handle("ajustes", "leer"),
			controller.obtener,
		);

		docs.registerPath({
			method: "put",
			path: "/",
			tags,
			security,
			summary: "Actualizar ajustes del sistema",
			request: {
				body: {
					required: true,
					content: {
						"application/json": { schema: actualizarAjustesSchema },
					},
				},
			},
			responses: {
				200: jsonResponse(ajustesDtoSchema, "Ajustes actualizados"),
				400: errorResponse("Datos inválidos"),
				...protectedErrorResponses("ajustes:actualizar"),
			},
		});
		this.router.put(
			"/",
			authMiddleware.handle,
			requierePermiso.handle("ajustes", "actualizar"),
			controller.actualizar,
		);

		this.registrarRutasImagen(
			"logo",
			authMiddleware,
			requierePermiso,
			imagenController,
		);
		this.registrarRutasImagen(
			"favicon",
			authMiddleware,
			requierePermiso,
			imagenController,
		);
	}

	private registrarRutasImagen(
		tipo: TipoImagenAjuste,
		authMiddleware: AuthMiddleware,
		requierePermiso: PermisoGuard,
		imagenController: ImagenAjusteController,
	) {
		const docs = this.router.openAPIRegistry;
		const ruta = `/${tipo}`;
		const nombre = tipo === "logo" ? "logo" : "favicon";
		const formatos = tipo === "logo" ? "PNG, JPEG o WebP" : "PNG, WebP o ICO";

		docs.registerPath({
			method: "get",
			path: ruta,
			tags,
			security: [],
			summary: `Imagen del ${nombre} del sistema (pública, cacheable)`,
			responses: {
				200: {
					description: `Imagen ${formatos}`,
					content: {
						"image/*": { schema: z.string().openapi({ format: "binary" }) },
					},
				},
				404: errorResponse(`No hay ${nombre} configurado`),
			},
		});
		this.router.get(ruta, imagenController.obtener(tipo));

		docs.registerPath({
			method: "put",
			path: ruta,
			tags,
			security,
			summary: `Subir el ${nombre} del sistema (multipart, campo «archivo», máx. 2 MB)`,
			request: {
				body: {
					required: true,
					content: {
						"multipart/form-data": {
							schema: z.object({
								archivo: z.string().openapi({ format: "binary" }),
							}),
						},
					},
				},
			},
			responses: {
				200: jsonResponse(ajustesDtoSchema, `Ajustes con el ${nombre} nuevo`),
				400: errorResponse(`Archivo ausente o no es ${formatos}`),
				413: errorResponse("La imagen supera los 2 MB"),
				...protectedErrorResponses("ajustes:actualizar"),
			},
		});
		this.router.put(
			ruta,
			authMiddleware.handle,
			requierePermiso.handle("ajustes", "actualizar"),
			bodyLimit({
				maxSize: IMAGEN_AJUSTE_MAX_BYTES + 64 * 1024,
				onError: (c) => c.json({ error: "La imagen supera los 2 MB" }, 413),
			}),
			imagenController.subir(tipo),
		);

		docs.registerPath({
			method: "delete",
			path: ruta,
			tags,
			security,
			summary: `Quitar el ${nombre} del sistema`,
			responses: {
				200: jsonResponse(ajustesDtoSchema, `Ajustes sin ${nombre}`),
				...protectedErrorResponses("ajustes:actualizar"),
			},
		});
		this.router.delete(
			ruta,
			authMiddleware.handle,
			requierePermiso.handle("ajustes", "actualizar"),
			imagenController.eliminar(tipo),
		);
	}
}
