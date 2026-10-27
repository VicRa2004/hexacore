import type { Context } from "hono";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { AuthEnv } from "@/modules/auth";
import type { CambiarAvatarUseCase } from "../../../application/useCases/CambiarAvatarUseCase";
import type { ObtenerAvatarUseCase } from "../../../application/useCases/ObtenerAvatarUseCase";
import { AvatarInvalidoError } from "../../../domain/error/AvatarInvalidoError";
import { usuarioIdSchema } from "../schemas/usuarioSchemas";

export class AvatarController extends BaseController {
	constructor(
		private readonly useCases: {
			cambiar: CambiarAvatarUseCase;
			obtener: ObtenerAvatarUseCase;
		},
	) {
		super();
	}

	obtener = (c: Context): Promise<Response> =>
		this.executeSafely(c, async () => {
			const { id } = validate(usuarioIdSchema, c.req.param());
			const { datos, tipo } = await this.useCases.obtener.ejecutar(id);
			// La URL lleva la clave (`?v=`): si cambia el avatar, cambia la URL.
			c.header("Cache-Control", "public, max-age=31536000, immutable");
			c.header("Content-Type", tipo);
			c.header("X-Content-Type-Options", "nosniff");
			return c.body(datos);
		});

	subir = (c: Context<AuthEnv>): Promise<Response> =>
		this.executeSafely(c, async () => {
			const { archivo } = await c.req.parseBody();
			if (!(archivo instanceof File)) {
				throw new AvatarInvalidoError("Falta el archivo en el campo «archivo»");
			}
			const datos = new Uint8Array(await archivo.arrayBuffer());
			return this.ok(
				c,
				await this.useCases.cambiar.ejecutar(c.get("usuario").id, datos),
			);
		});

	eliminar = (c: Context<AuthEnv>): Promise<Response> =>
		this.executeSafely(c, async () =>
			this.ok(
				c,
				await this.useCases.cambiar.ejecutar(c.get("usuario").id, null),
			),
		);
}
