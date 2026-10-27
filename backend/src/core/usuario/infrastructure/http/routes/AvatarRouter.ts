import { OpenAPIHono, z } from "@hono/zod-openapi";
import { bodyLimit } from "hono/body-limit";
import {
	errorResponse,
	jsonResponse,
} from "@/core/shared/infrastructure/http/openapi";
import type { AuthMiddleware } from "@/modules/auth";
import { AVATAR_MAX_BYTES } from "../../../application/useCases/CambiarAvatarUseCase";
import type { AvatarController } from "../controllers/AvatarController";
import { usuarioDtoSchema, usuarioIdSchema } from "../schemas/usuarioSchemas";

const tags = ["Avatares"];
const security = [{ bearerAuth: [] }];

export class AvatarRouter {
	public readonly router = new OpenAPIHono();

	constructor(authMiddleware: AuthMiddleware, controller: AvatarController) {
		const docs = this.router.openAPIRegistry;

		docs.registerPath({
			method: "get",
			path: "/{id}",
			tags,
			summary: "Imagen del avatar de un usuario (pública, cacheable)",
			request: { params: usuarioIdSchema },
			responses: {
				200: {
					description: "Imagen PNG, JPEG o WebP",
					content: {
						"image/*": { schema: z.string().openapi({ format: "binary" }) },
					},
				},
				404: errorResponse("El usuario no existe o no tiene avatar"),
			},
		});
		this.router.get("/:id", controller.obtener);

		docs.registerPath({
			method: "put",
			path: "/",
			tags,
			security,
			summary: "Subir el avatar propio (multipart, campo «archivo», máx. 2 MB)",
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
				200: jsonResponse(usuarioDtoSchema, "Usuario con el avatar nuevo"),
				400: errorResponse("Archivo ausente o no es PNG, JPEG ni WebP"),
				401: errorResponse("No autenticado"),
				413: errorResponse("El archivo supera los 2 MB"),
			},
		});
		this.router.put(
			"/",
			authMiddleware.handle,
			// Margen para las cabeceras del multipart; el tamaño exacto lo valida el caso de uso.
			bodyLimit({
				maxSize: AVATAR_MAX_BYTES + 64 * 1024,
				onError: (c) => c.json({ error: "El archivo supera los 2 MB" }, 413),
			}),
			controller.subir,
		);

		docs.registerPath({
			method: "delete",
			path: "/",
			tags,
			security,
			summary: "Quitar el avatar propio",
			responses: {
				200: jsonResponse(usuarioDtoSchema, "Usuario sin avatar"),
				401: errorResponse("No autenticado"),
			},
		});
		this.router.delete("/", authMiddleware.handle, controller.eliminar);
	}
}
