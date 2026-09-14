import { injectable, inject } from "tsyringe";
import type { AuthorizationRepository } from "../../domain/repository/AuthorizationRepository";
import type { PermissionDto } from "../dtos/PermissionDto";
import { PermissionMapper } from "../mappers/PermissionMapper";

/**
 * Caso de uso: Lista todos los permisos registrados en el sistema.
 *
 * @method run - método principal obligatorio por convención del proyecto
 */
@injectable()
export class GetAllPermissionsUseCase {
	constructor(
		@inject("AuthorizationRepository")
		private readonly authorizationRepository: AuthorizationRepository,
	) {}

	async run(): Promise<PermissionDto[]> {
		const permissions = await this.authorizationRepository.findAll();
		return PermissionMapper.toDtoList(permissions);
	}
}
