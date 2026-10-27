import type { EventBus } from "@/core/shared/domain/events/EventBus";
import type { UnitOfWork } from "@/core/shared/domain/UnitOfWork";
import { UsuarioNoEncontradoError } from "../../domain/error/UsuarioNoEncontradoError";
import type { UsuarioRepository } from "../../domain/repository/UsuarioRepository";

/** Borrado lógico: el usuario deja de existir para la app pero su fila queda en la BD. */
export class EliminarUsuarioUseCase {
	constructor(
		private readonly usuarioRepository: UsuarioRepository,
		private readonly eventBus: EventBus,
		private readonly uow: UnitOfWork,
	) {}

	async ejecutar(id: number) {
		const usuario = await this.usuarioRepository.buscarPorId(id);
		if (!usuario) {
			throw new UsuarioNoEncontradoError();
		}

		usuario.eliminar();
		await this.uow.ejecutar(async () => {
			await this.usuarioRepository.eliminar(id);
			await this.eventBus.publishAll(usuario.pullDomainEvents());
		});
	}
}
