import { randomUUID } from "node:crypto";
import type { Almacenamiento } from "@/core/shared/domain/Almacenamiento";
import type { EventBus } from "@/core/shared/domain/events/EventBus";
import type { UnitOfWork } from "@/core/shared/domain/UnitOfWork";
import { AvatarInvalidoError } from "../../domain/error/AvatarInvalidoError";
import { UsuarioNoEncontradoError } from "../../domain/error/UsuarioNoEncontradoError";
import type { UsuarioRepository } from "../../domain/repository/UsuarioRepository";
import type { UsuarioDto } from "../dtos/UsuarioDto";
import { UsuarioMapper } from "../mappers/UsuarioMapper";

export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;

/** Tipo real por los primeros bytes: el `Content-Type` del cliente no es de fiar. */
function detectarTipo(datos: Uint8Array): { tipo: string; ext: string } | null {
	const empieza = (bytes: number[], desde = 0) =>
		bytes.every((b, i) => datos[desde + i] === b);
	if (empieza([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
		return { tipo: "image/png", ext: "png" };
	if (empieza([0xff, 0xd8, 0xff])) return { tipo: "image/jpeg", ext: "jpg" };
	if (empieza([0x52, 0x49, 0x46, 0x46]) && empieza([0x57, 0x45, 0x42, 0x50], 8))
		return { tipo: "image/webp", ext: "webp" };
	return null;
}

/** Sube (o con `null` quita) el avatar del usuario y borra el archivo anterior. */
export class CambiarAvatarUseCase {
	constructor(
		private readonly usuarioRepository: UsuarioRepository,
		private readonly almacenamiento: Almacenamiento,
		private readonly eventBus: EventBus,
		private readonly uow: UnitOfWork,
	) {}

	async ejecutar(id: number, datos: Uint8Array | null): Promise<UsuarioDto> {
		const usuario = await this.usuarioRepository.buscarPorId(id);
		if (!usuario) {
			throw new UsuarioNoEncontradoError();
		}

		let clave: string | null = null;
		if (datos) {
			if (datos.byteLength > AVATAR_MAX_BYTES) {
				throw new AvatarInvalidoError("El avatar no puede superar los 2 MB");
			}
			const formato = detectarTipo(datos);
			if (!formato) {
				throw new AvatarInvalidoError("El avatar debe ser PNG, JPEG o WebP");
			}
			// Clave nueva en cada subida: la URL cambia y la caché del navegador no sirve la vieja.
			clave = `avatares/${id}-${randomUUID()}.${formato.ext}`;
			await this.almacenamiento.guardar(clave, datos, formato.tipo);
		}

		const anterior = usuario.getAvatar();
		usuario.cambiarAvatar(clave);
		try {
			const guardado = await this.uow.ejecutar(async () => {
				const actualizado = await this.usuarioRepository.actualizar(usuario);
				await this.eventBus.publishAll(usuario.pullDomainEvents());
				return actualizado;
			});
			if (anterior) await this.almacenamiento.eliminar(anterior);
			return UsuarioMapper.toDto(guardado);
		} catch (error) {
			if (clave) await this.almacenamiento.eliminar(clave);
			throw error;
		}
	}
}
