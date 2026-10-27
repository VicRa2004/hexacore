import type { AutorizacionRepository } from "../../domain/repository/AutorizacionRepository";
import type { CrearPermisoDto } from "../dtos/CrearPermisoDto";
import type { PermisoDto } from "../dtos/PermisoDto";
import { PermisoMapper } from "../mappers/PermisoMapper";

/**
 * Caso de uso: Crea un nuevo permiso atómico (recurso + accion).
 *
 * @throws {PermisoYaExisteError} si la combinación ya existe.
 * @method ejecutar - método principal obligatorio por convención del proyecto
 */
export class CrearPermisoUseCase {
	constructor(
		private readonly autorizacionRepository: AutorizacionRepository,
	) {}

	async ejecutar(dto: CrearPermisoDto): Promise<PermisoDto> {
		const permiso = await this.autorizacionRepository.crear(
			dto.recurso,
			dto.accion,
		);

		return PermisoMapper.toDto(permiso);
	}
}
