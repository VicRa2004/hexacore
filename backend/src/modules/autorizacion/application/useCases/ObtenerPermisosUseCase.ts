import type { AutorizacionRepository } from "../../domain/repository/AutorizacionRepository";
import type { PermisoDto } from "../dtos/PermisoDto";
import { PermisoMapper } from "../mappers/PermisoMapper";

/**
 * Caso de uso: Lista todos los permisos registrados en el sistema.
 *
 * @method ejecutar - método principal obligatorio por convención del proyecto
 */
export class ObtenerPermisosUseCase {
	constructor(
		private readonly autorizacionRepository: AutorizacionRepository,
	) {}

	async ejecutar(): Promise<PermisoDto[]> {
		const permisos = await this.autorizacionRepository.buscarTodos();
		return PermisoMapper.toDtoList(permisos);
	}
}
