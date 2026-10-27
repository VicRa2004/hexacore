import type { RolRepository } from "../../domain/repository/RolRepository";
import type { RolDto } from "../dtos/RolDto";
import { RolMapper } from "../mappers/RolMapper";

/**
 * Caso de uso: Lista todos los roles con sus permisos.
 *
 * @method ejecutar - método principal obligatorio por convención del proyecto
 */
export class ObtenerRolesUseCase {
	constructor(private readonly rolRepository: RolRepository) {}

	async ejecutar(): Promise<RolDto[]> {
		return RolMapper.toDtoList(await this.rolRepository.buscarTodos());
	}
}
