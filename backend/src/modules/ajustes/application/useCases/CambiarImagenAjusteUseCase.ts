import { randomUUID } from "node:crypto";
import type { LectorAjustes } from "@/core/shared/domain/AjustesSistema";
import type { Almacenamiento } from "@/core/shared/domain/Almacenamiento";
import type { EventBus } from "@/core/shared/domain/events/EventBus";
import type { UnitOfWork } from "@/core/shared/domain/UnitOfWork";
import { ImagenAjusteInvalidaError } from "../../domain/error/ImagenAjusteInvalidaError";
import { AjustesActualizadosEvent } from "../../domain/event/AjustesActualizadosEvent";
import type { AjusteRepository } from "../../domain/repository/AjusteRepository";
import type { AjustesDto, TipoImagenAjuste } from "../dtos/AjustesDto";
import { AjustesMapper } from "../mappers/AjustesMapper";

export const IMAGEN_AJUSTE_MAX_BYTES = 2 * 1024 * 1024;

function detectarFormatoImagen(
	datos: Uint8Array,
	tipo: TipoImagenAjuste,
): { mime: string; ext: string } | null {
	const empieza = (bytes: number[], desde = 0) =>
		bytes.every((b, i) => datos[desde + i] === b);

	if (empieza([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
		return { mime: "image/png", ext: "png" };
	}
	if (
		empieza([0x52, 0x49, 0x46, 0x46]) &&
		empieza([0x57, 0x45, 0x42, 0x50], 8)
	) {
		return { mime: "image/webp", ext: "webp" };
	}
	if (tipo === "logo" && empieza([0xff, 0xd8, 0xff])) {
		return { mime: "image/jpeg", ext: "jpg" };
	}
	// ICO: 00 00 01 00 (se rechaza SVG para evitar XSS en mismo origen)
	if (tipo === "favicon" && empieza([0x00, 0x00, 0x01, 0x00])) {
		return { mime: "image/x-icon", ext: "ico" };
	}
	return null;
}

/** Sube (o con `null` quita) el logo o favicon del sistema e invalida la caché. */
export class CambiarImagenAjusteUseCase {
	constructor(
		private readonly repo: AjusteRepository,
		private readonly lector: LectorAjustes,
		private readonly almacenamiento: Almacenamiento,
		private readonly eventBus: EventBus,
		private readonly uow: UnitOfWork,
	) {}

	async ejecutar(
		tipo: TipoImagenAjuste,
		datos: Uint8Array | null,
	): Promise<AjustesDto> {
		const claveAjuste = tipo === "logo" ? "logoClave" : "faviconClave";
		const actuales = await this.lector.obtener();
		const anterior =
			tipo === "logo" ? actuales.logoClave : actuales.faviconClave;

		let nuevaClave: string | null = null;
		if (datos) {
			if (datos.byteLength > IMAGEN_AJUSTE_MAX_BYTES) {
				throw new ImagenAjusteInvalidaError(
					"La imagen no puede superar los 2 MB",
				);
			}
			const formato = detectarFormatoImagen(datos, tipo);
			if (!formato) {
				const permitidos =
					tipo === "logo" ? "PNG, JPEG o WebP" : "PNG, WebP o ICO";
				throw new ImagenAjusteInvalidaError(
					`El ${tipo} debe ser ${permitidos}`,
				);
			}
			nuevaClave = `ajustes/${tipo}-${randomUUID()}.${formato.ext}`;
			await this.almacenamiento.guardar(nuevaClave, datos, formato.mime);
		}

		try {
			await this.uow.ejecutar(async () => {
				if (nuevaClave) {
					await this.repo.guardarVarios([
						{ clave: claveAjuste, valor: nuevaClave },
					]);
				} else {
					await this.repo.eliminar(claveAjuste);
				}
				await this.eventBus.publish(
					new AjustesActualizadosEvent({ claves: [claveAjuste] }),
				);
			});
		} catch (error) {
			if (nuevaClave) {
				try {
					await this.almacenamiento.eliminar(nuevaClave);
				} catch (err: unknown) {
					console.warn(
						`No se pudo limpiar la imagen recién subida (${nuevaClave}):`,
						err,
					);
				}
			}
			throw error;
		}

		this.lector.invalidar();
		if (anterior) {
			// La transacción ya se confirmó: un fallo al limpiar la imagen vieja no debe abortar ni borrar la nueva.
			try {
				await this.almacenamiento.eliminar(anterior);
			} catch (error: unknown) {
				console.warn(
					`No se pudo eliminar la imagen anterior (${anterior}):`,
					error,
				);
			}
		}
		return AjustesMapper.toDto(await this.lector.obtener());
	}
}
