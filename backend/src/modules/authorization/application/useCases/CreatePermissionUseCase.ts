import { injectable, inject } from "tsyringe";
import type { AuthorizationRepository } from "../../domain/repository/AuthorizationRepository";
import type { CreatePermissionDto } from "../dtos/CreatePermissionDto";
import type { PermissionDto } from "../dtos/PermissionDto";
import { PermissionMapper } from "../mappers/PermissionMapper";

/**
 * Caso de uso: Crea un nuevo permiso atómico (resource + action).
 *
 * @throws {PermissionAlreadyExistsError} si la combinación ya existe.
 * @method run - método principal obligatorio por convención del proyecto
 */
@injectable()
export class CreatePermissionUseCase {
  constructor(
    @inject("AuthorizationRepository")
    private readonly authorizationRepository: AuthorizationRepository,
  ) {}

  async run(dto: CreatePermissionDto): Promise<PermissionDto> {
    const permission = await this.authorizationRepository.create(
      dto.resource,
      dto.action,
    );

    return PermissionMapper.toDto(permission);
  }
}
