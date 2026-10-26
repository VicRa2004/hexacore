import type { AuthorizationRepository } from "../../domain/repository/AuthorizationRepository";
import type { PermissionDto } from "../dtos/PermissionDto";
import { PermissionMapper } from "../mappers/PermissionMapper";
import { PermissionNotFoundError } from "../../domain/error/PermissionNotFoundError";

/**
 * Caso de uso: Obtiene un permiso por su ID.
 *
 * @throws {PermissionNotFoundError} si el permiso no existe.
 * @method run - método principal obligatorio por convención del proyecto
 */
export class GetPermissionUseCase {
	constructor(
		private readonly authorizationRepository: AuthorizationRepository,
	) {}

	async run(id: number): Promise<PermissionDto> {
		const permission = await this.authorizationRepository.findById(id);

		if (!permission) {
			throw new PermissionNotFoundError(id);
		}

		return PermissionMapper.toDto(permission);
	}
}
