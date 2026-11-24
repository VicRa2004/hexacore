import { BaseError } from "@/core/shared/domain/error/BaseError";
import type { EventBus } from "@/core/shared/domain/events/EventBus";
import type { UnitOfWork } from "@/core/shared/domain/UnitOfWork";
import {
	type PasswordHasher,
	UsuarioNoEncontradoError,
	type UsuarioRepository,
} from "@/core/usuario";
import { DosFactoresDesactivadoEvent } from "../../domain/event/DosFactoresDesactivadoEvent";
import type { DosFactoresRepository } from "../../domain/repository/DosFactoresRepository";
import type { DesactivarDosFactoresDto } from "../dtos/DosFactoresDto";
import type { VerificadorDosFactores } from "../services/VerificadorDosFactores";

/** Pide contraseña y segundo factor: un access token robado no basta para quitar el 2FA. */
export class DesactivarDosFactoresUseCase {
	constructor(
		private readonly usuarioRepository: UsuarioRepository,
		private readonly passwordHasher: PasswordHasher,
		private readonly verificador: VerificadorDosFactores,
		private readonly dosFactores: DosFactoresRepository,
		private readonly eventBus: EventBus,
		private readonly uow: UnitOfWork,
	) {}

	async ejecutar(
		usuarioId: number,
		dto: DesactivarDosFactoresDto,
	): Promise<void> {
		const usuario = await this.usuarioRepository.buscarPorId(usuarioId);
		if (!usuario) throw new UsuarioNoEncontradoError();
		const isPasswordValida = await this.passwordHasher.comparar(
			dto.password,
			usuario.getPasswordHash(),
		);
		if (!isPasswordValida) {
			throw new BaseError("La contraseña no es correcta", 400);
		}
		await this.verificador.verificar(usuarioId, dto.codigo, 400);

		await this.uow.ejecutar(async () => {
			await this.dosFactores.desactivar(usuarioId);
			await this.eventBus.publish(
				new DosFactoresDesactivadoEvent({ usuarioId }),
			);
		});
	}
}
