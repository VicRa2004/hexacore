import type { LectorAjustes } from "@/core/shared/domain/AjustesSistema";
import type { Almacenamiento } from "@/core/shared/domain/Almacenamiento";
import { ImagenAjusteNoEncontradaError } from "../../domain/error/ImagenAjusteNoEncontradaError";
import type { TipoImagenAjuste } from "../dtos/AjustesDto";

const TIPOS_MIME: Record<string, string> = {
	png: "image/png",
	jpg: "image/jpeg",
	webp: "image/webp",
	ico: "image/x-icon",
};

export class ObtenerImagenAjusteUseCase {
	constructor(
		private readonly lector: LectorAjustes,
		private readonly almacenamiento: Almacenamiento,
	) {}

	async ejecutar(
		tipo: TipoImagenAjuste,
	): Promise<{ datos: Uint8Array<ArrayBuffer>; mime: string }> {
		const ajustes = await this.lector.obtener();
		const clave = tipo === "logo" ? ajustes.logoClave : ajustes.faviconClave;
		const datos = clave ? await this.almacenamiento.obtener(clave) : null;
		if (!clave || !datos) {
			throw new ImagenAjusteNoEncontradaError(tipo);
		}
		const ext = clave.slice(clave.lastIndexOf(".") + 1);
		return {
			datos,
			mime: TIPOS_MIME[ext] ?? "application/octet-stream",
		};
	}
}
