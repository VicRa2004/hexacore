import { RolNoEncontradoError } from "../../domain/error/RolNoEncontradoError";
import type { RolRepository } from "../../domain/repository/RolRepository";
import type { RolDto } from "../dtos/RolDto";
import { RolMapper } from "../mappers/RolMapper";

/**
 * Caso de uso: Obtiene un rol por su ID.
 *
 * @throws {RolNoEncontradoError} si el rol no existe.
 * @method ejecutar - método principal obligatorio por convención del proyecto
 */
export class ObtenerRolUseCase {
	constructor(private readonly rolRepository: RolRepository) {}

	async ejecutar(id: number): Promise<RolDto> {
		const rol = await this.rolRepository.buscarPorId(id);

		if (!rol) {
			throw new RolNoEncontradoError(id);
		}

		return RolMapper.toDto(rol);
	}
}
