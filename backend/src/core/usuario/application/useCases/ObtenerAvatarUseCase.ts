import type { Almacenamiento } from "@/core/shared/domain/Almacenamiento";
import { AvatarNoEncontradoError } from "../../domain/error/AvatarNoEncontradoError";
import type { UsuarioRepository } from "../../domain/repository/UsuarioRepository";

const TIPOS: Record<string, string> = {
	png: "image/png",
	jpg: "image/jpeg",
	webp: "image/webp",
};

export class ObtenerAvatarUseCase {
	constructor(
		private readonly usuarioRepository: UsuarioRepository,
		private readonly almacenamiento: Almacenamiento,
	) {}

	async ejecutar(
		id: number,
	): Promise<{ datos: Uint8Array<ArrayBuffer>; tipo: string }> {
		const clave = (await this.usuarioRepository.buscarPorId(id))?.getAvatar();
		const datos = clave ? await this.almacenamiento.obtener(clave) : null;
		if (!clave || !datos) {
			throw new AvatarNoEncontradoError();
		}
		const ext = clave.slice(clave.lastIndexOf(".") + 1);
		return { datos, tipo: TIPOS[ext] ?? "application/octet-stream" };
	}
}
