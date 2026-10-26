import type { AuthorizationRepository } from "../../domain/repository/AuthorizationRepository";
import type { PermissionDto } from "../dtos/PermissionDto";
import { PermissionMapper } from "../mappers/PermissionMapper";

/**
 * Caso de uso: Lista todos los permisos registrados en el sistema.
 *
 * @method run - método principal obligatorio por convención del proyecto
 */
export class GetAllPermissionsUseCase {
	constructor(
		private readonly authorizationRepository: AuthorizationRepository,
	) {}

	async run(): Promise<PermissionDto[]> {
		const permissions = await this.authorizationRepository.findAll();
		return PermissionMapper.toDtoList(permissions);
	}
}
