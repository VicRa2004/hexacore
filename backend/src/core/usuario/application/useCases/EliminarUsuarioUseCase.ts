import { UsuarioNoEncontradoError } from "../../domain/error/UsuarioNoEncontradoError";
import type { UsuarioRepository } from "../../domain/repository/UsuarioRepository";

export class EliminarUsuarioUseCase {
	constructor(private readonly usuarioRepository: UsuarioRepository) {}

	async ejecutar(id: number) {
		const usuario = await this.usuarioRepository.buscarPorId(id);
		if (!usuario) {
			throw new UsuarioNoEncontradoError();
		}
		await this.usuarioRepository.eliminar(id);
	}
}
