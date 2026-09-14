import { injectable, inject } from "tsyringe";
import type { AuthorizationRepository } from "../../domain/repository/AuthorizationRepository";
import type { UpdatePermissionDto } from "../dtos/UpdatePermissionDto";
import type { PermissionDto } from "../dtos/PermissionDto";
import { PermissionMapper } from "../mappers/PermissionMapper";

/**
 * Caso de uso: Actualiza el resource y/o action de un permiso existente.
 *
 * @throws {PermissionNotFoundError} si el permiso no existe.
 * @throws {PermissionAlreadyExistsError} si la nueva combinación ya existe.
 * @method run - método principal obligatorio por convención del proyecto
 */
@injectable()
export class UpdatePermissionUseCase {
	constructor(
		@inject("AuthorizationRepository")
		private readonly authorizationRepository: AuthorizationRepository,
	) {}

	async run(id: number, dto: UpdatePermissionDto): Promise<PermissionDto> {
		const permission = await this.authorizationRepository.update(
			id,
			dto.resource,
			dto.action,
		);

		return PermissionMapper.toDto(permission);
	}
}
