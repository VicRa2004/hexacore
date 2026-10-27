import type { ActualizarUsuarioDto } from "../dtos/ActualizarUsuarioDto";
import type { UsuarioDto } from "../dtos/UsuarioDto";
import type { UsuarioRepository } from "../../domain/repository/UsuarioRepository";
import type { PasswordHasher } from "../../domain/service/PasswordHasher";
import { UsuarioMapper } from "../mappers/UsuarioMapper";
import { UsuarioNoEncontradoError } from "../../domain/error/UsuarioNoEncontradoError";

export class ActualizarUsuarioUseCase {
	constructor(
		private readonly usuarioRepository: UsuarioRepository,
		private readonly passwordHasher: PasswordHasher,
	) {}

	async ejecutar(id: number, dto: ActualizarUsuarioDto): Promise<UsuarioDto> {
		const usuario = await this.usuarioRepository.buscarPorId(id);
		if (!usuario) {
			throw new UsuarioNoEncontradoError();
		}

		usuario.actualizar({
			nombre: dto.nombre,
			email: dto.email,
			passwordHash: dto.password
				? await this.passwordHasher.hash(dto.password)
				: undefined,
		});

		const usuarioActualizado = await this.usuarioRepository.actualizar(usuario);
		return UsuarioMapper.toDto(usuarioActualizado);
	}
}
