import { injectable, inject } from "tsyringe";
import type { AuthorizationRepository } from "../../domain/repository/AuthorizationRepository";

/**
 * Caso de uso: Elimina un permiso por su ID.
 *
 * @throws {PermissionNotFoundError} si el permiso no existe.
 * @method run - método principal obligatorio por convención del proyecto
 */
@injectable()
export class DeletePermissionUseCase {
	constructor(
		@inject("AuthorizationRepository")
		private readonly authorizationRepository: AuthorizationRepository,
	) {}

	async run(id: number): Promise<void> {
		await this.authorizationRepository.delete(id);
	}
}
