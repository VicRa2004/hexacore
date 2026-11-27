import type { Context } from "hono";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import type { TipoImagenAjuste } from "../../../application/dtos/AjustesDto";
import type { CambiarImagenAjusteUseCase } from "../../../application/useCases/CambiarImagenAjusteUseCase";
import type { ObtenerImagenAjusteUseCase } from "../../../application/useCases/ObtenerImagenAjusteUseCase";
import { ImagenAjusteInvalidaError } from "../../../domain/error/ImagenAjusteInvalidaError";

export class ImagenAjusteController extends BaseController {
	constructor(
		private readonly useCases: {
			obtener: ObtenerImagenAjusteUseCase;
			cambiar: CambiarImagenAjusteUseCase;
		},
	) {
		super();
	}

	obtener =
		(tipo: TipoImagenAjuste) =>
		(c: Context): Promise<Response> =>
			this.executeSafely(c, async () => {
				const { datos, mime } = await this.useCases.obtener.ejecutar(tipo);
				c.header("Cache-Control", "public, max-age=31536000, immutable");
				c.header("Content-Type", mime);
				c.header("X-Content-Type-Options", "nosniff");
				return c.body(datos);
			});

	subir =
		(tipo: TipoImagenAjuste) =>
		(c: Context): Promise<Response> =>
			this.executeSafely(c, async () => {
				const { archivo } = await c.req.parseBody();
				if (!(archivo instanceof File)) {
					throw new ImagenAjusteInvalidaError(
						"Falta el archivo en el campo «archivo»",
					);
				}
				const datos = new Uint8Array(await archivo.arrayBuffer());
				return this.ok(c, await this.useCases.cambiar.ejecutar(tipo, datos));
			});

	eliminar =
		(tipo: TipoImagenAjuste) =>
		(c: Context): Promise<Response> =>
			this.executeSafely(c, async () =>
				this.ok(c, await this.useCases.cambiar.ejecutar(tipo, null)),
			);
}
