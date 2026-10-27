import type { CrearUsuarioDto } from "../dtos/CrearUsuarioDto";
import type { UsuarioDto } from "../dtos/UsuarioDto";
import type { UsuarioRepository } from "../../domain/repository/UsuarioRepository";
import { Usuario } from "../../domain/Usuario";
import { BaseError } from "@/core/shared/domain/error/BaseError";
import { UsuarioMapper } from "../mappers/UsuarioMapper";
import type { PasswordHasher } from "../../domain/service/PasswordHasher";
import type { EventBus } from "@/core/shared/domain/events/EventBus";
import type { UnitOfWork } from "@/core/shared/domain/UnitOfWork";

export class CrearUsuarioUseCase {
	constructor(
		private readonly usuarioRepository: UsuarioRepository,
		private readonly passwordHasher: PasswordHasher,
		private readonly eventBus: EventBus,
		private readonly uow: UnitOfWork,
	) {}

	async ejecutar(dto: CrearUsuarioDto): Promise<UsuarioDto> {
		const usuarioExistente = await this.usuarioRepository.buscarPorEmail(
			dto.email,
		);
		if (usuarioExistente) {
			throw new BaseError("Ya existe un usuario con ese email", 400);
		}

		const passwordHash = await this.passwordHasher.hash(dto.password);
		const usuario = Usuario.crear(dto.nombre, dto.email, passwordHash);

		// Usuario y evento en la misma transacción: con el outbox, o ambos o ninguno.
		const usuarioCreado = await this.uow.ejecutar(async () => {
			const creado = await this.usuarioRepository.crear(usuario);
			creado.agregarEventoCreado();
			await this.eventBus.publishAll(creado.pullDomainEvents());
			return creado;
		});

		return UsuarioMapper.toDto(usuarioCreado);
	}
}
