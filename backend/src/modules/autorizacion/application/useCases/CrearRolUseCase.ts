import type { RolRepository } from "../../domain/repository/RolRepository";
import type { CrearRolDto } from "../dtos/CrearRolDto";
import type { RolDto } from "../dtos/RolDto";
import { RolMapper } from "../mappers/RolMapper";

/**
 * Caso de uso: Crea un rol con los permisos indicados.
 *
 * @throws {RolYaExisteError} si el nombre ya está en uso.
 * @throws {PermisoNoEncontradoError} si algún permiso no existe.
 * @method ejecutar - método principal obligatorio por convención del proyecto
 */
export class CrearRolUseCase {
	constructor(private readonly rolRepository: RolRepository) {}

	async ejecutar(dto: CrearRolDto): Promise<RolDto> {
		const rol = await this.rolRepository.crear({
			nombre: dto.nombre,
			descripcion: dto.descripcion ?? null,
			permisoIds: dto.permisoIds,
		});

		return RolMapper.toDto(rol);
	}
}
