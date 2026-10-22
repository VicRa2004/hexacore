import { injectable, inject } from "tsyringe";
import { AUTHORIZATION_TOKENS } from "@/modules/authorization/application/tokens";
import type { AuthorizationRepository } from "../../domain/repository/AuthorizationRepository";
import type { PermissionDto } from "../dtos/PermissionDto";
import { PermissionMapper } from "../mappers/PermissionMapper";

/**
 * Caso de uso: Retorna los permisos efectivos de un usuario.
 *
 * Combina los permisos heredados de roles con las excepciones directas
 * del usuario (granted = true / false).
 *
 * @method run - método principal obligatorio por convención del proyecto
 */
@injectable()
export class GetUserPermissionsUseCase {
	constructor(
		@inject(AUTHORIZATION_TOKENS.AuthorizationRepository)
		private readonly authorizationRepository: AuthorizationRepository,
	) {}

	async run(userId: number): Promise<PermissionDto[]> {
		const permissions =
			await this.authorizationRepository.getEffectivePermissions(userId);

		return PermissionMapper.toDtoList(permissions);
	}
}
