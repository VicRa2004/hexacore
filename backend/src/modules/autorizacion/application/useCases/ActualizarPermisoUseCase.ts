import type { AutorizacionRepository } from "../../domain/repository/AutorizacionRepository";
import type { ActualizarPermisoDto } from "../dtos/ActualizarPermisoDto";
import type { PermisoDto } from "../dtos/PermisoDto";
import { PermisoMapper } from "../mappers/PermisoMapper";

/**
 * Caso de uso: Actualiza el recurso y/o accion de un permiso existente.
 *
 * @throws {PermisoNoEncontradoError} si el permiso no existe.
 * @throws {PermisoYaExisteError} si la nueva combinación ya existe.
 * @method ejecutar - método principal obligatorio por convención del proyecto
 */
export class ActualizarPermisoUseCase {
	constructor(
		private readonly autorizacionRepository: AutorizacionRepository,
	) {}

	async ejecutar(id: number, dto: ActualizarPermisoDto): Promise<PermisoDto> {
		const permiso = await this.autorizacionRepository.actualizar(
			id,
			dto.recurso,
			dto.accion,
		);

		return PermisoMapper.toDto(permiso);
	}
}
