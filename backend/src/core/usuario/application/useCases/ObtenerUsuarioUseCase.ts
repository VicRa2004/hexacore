import { UsuarioNoEncontradoError } from "../../domain/error/UsuarioNoEncontradoError";
import type { UsuarioRepository } from "../../domain/repository/UsuarioRepository";
import type { UsuarioDto } from "../dtos/UsuarioDto";
import { UsuarioMapper } from "../mappers/UsuarioMapper";

export class ObtenerUsuarioUseCase {
	constructor(private readonly usuarioRepository: UsuarioRepository) {}

	async ejecutar(id: number): Promise<UsuarioDto> {
		const usuario = await this.usuarioRepository.buscarPorId(id);
		if (!usuario) {
			throw new UsuarioNoEncontradoError();
		}
		return UsuarioMapper.toDto(usuario);
	}
}
