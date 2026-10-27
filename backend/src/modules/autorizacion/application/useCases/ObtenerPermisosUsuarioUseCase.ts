import type { AutorizacionRepository } from "../../domain/repository/AutorizacionRepository";
import type { PermisoDto } from "../dtos/PermisoDto";
import { PermisoMapper } from "../mappers/PermisoMapper";

/**
 * Caso de uso: Retorna los permisos efectivos de un usuario.
 *
 * Combina los permisos heredados de roles con las excepciones directas
 * del usuario (concedido = true / false).
 *
 * @method ejecutar - método principal obligatorio por convención del proyecto
 */
export class ObtenerPermisosUsuarioUseCase {
	constructor(
		private readonly autorizacionRepository: AutorizacionRepository,
	) {}

	async ejecutar(usuarioId: number): Promise<PermisoDto[]> {
		const permisos =
			await this.autorizacionRepository.obtenerPermisosEfectivos(usuarioId);

		return PermisoMapper.toDtoList(permisos);
	}
}
