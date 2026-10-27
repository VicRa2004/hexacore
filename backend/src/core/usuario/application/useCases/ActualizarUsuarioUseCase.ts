import type { ActualizarUsuarioDto } from "../dtos/ActualizarUsuarioDto";
import type { UsuarioDto } from "../dtos/UsuarioDto";
import type { UsuarioRepository } from "../../domain/repository/UsuarioRepository";
import type { PasswordHasher } from "../../domain/service/PasswordHasher";
import type { EventBus } from "@/core/shared/domain/events/EventBus";
import type { UnitOfWork } from "@/core/shared/domain/UnitOfWork";
import { UsuarioMapper } from "../mappers/UsuarioMapper";
import { UsuarioNoEncontradoError } from "../../domain/error/UsuarioNoEncontradoError";

export class ActualizarUsuarioUseCase {
	constructor(
		private readonly usuarioRepository: UsuarioRepository,
		private readonly passwordHasher: PasswordHasher,
		private readonly eventBus: EventBus,
		private readonly uow: UnitOfWork,
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

		const usuarioActualizado = await this.uow.ejecutar(async () => {
			const guardado = await this.usuarioRepository.actualizar(usuario);
			await this.eventBus.publishAll(usuario.pullDomainEvents());
			return guardado;
		});
		return UsuarioMapper.toDto(usuarioActualizado);
	}
}
