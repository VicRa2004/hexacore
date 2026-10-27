import type { AutorizacionRepository } from "../../domain/repository/AutorizacionRepository";
import type { PermisoDto } from "../dtos/PermisoDto";
import { PermisoMapper } from "../mappers/PermisoMapper";
import { PermisoNoEncontradoError } from "../../domain/error/PermisoNoEncontradoError";

/**
 * Caso de uso: Obtiene un permiso por su ID.
 *
 * @throws {PermisoNoEncontradoError} si el permiso no existe.
 * @method ejecutar - método principal obligatorio por convención del proyecto
 */
export class ObtenerPermisoUseCase {
	constructor(
		private readonly autorizacionRepository: AutorizacionRepository,
	) {}

	async ejecutar(id: number): Promise<PermisoDto> {
		const permiso = await this.autorizacionRepository.buscarPorId(id);

		if (!permiso) {
			throw new PermisoNoEncontradoError(id);
		}

		return PermisoMapper.toDto(permiso);
	}
}
