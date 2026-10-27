import type { RolRepository } from "../../domain/repository/RolRepository";
import type { ActualizarRolDto } from "../dtos/ActualizarRolDto";
import type { RolDto } from "../dtos/RolDto";
import { RolMapper } from "../mappers/RolMapper";

/**
 * Caso de uso: Reemplaza nombre, descripción y permisos de un rol.
 *
 * @throws {RolNoEncontradoError} si el rol no existe.
 * @throws {RolYaExisteError} si el nuevo nombre ya está en uso.
 * @throws {PermisoNoEncontradoError} si algún permiso no existe.
 * @method ejecutar - método principal obligatorio por convención del proyecto
 */
export class ActualizarRolUseCase {
	constructor(private readonly rolRepository: RolRepository) {}

	async ejecutar(id: number, dto: ActualizarRolDto): Promise<RolDto> {
		const rol = await this.rolRepository.actualizar(id, {
			nombre: dto.nombre,
			descripcion: dto.descripcion ?? null,
			permisoIds: dto.permisoIds,
		});

		return RolMapper.toDto(rol);
	}
}
