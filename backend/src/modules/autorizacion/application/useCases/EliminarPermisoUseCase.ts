import type { AutorizacionRepository } from "../../domain/repository/AutorizacionRepository";

/**
 * Caso de uso: Elimina un permiso por su ID.
 *
 * @throws {PermisoNoEncontradoError} si el permiso no existe.
 * @method ejecutar - método principal obligatorio por convención del proyecto
 */
export class EliminarPermisoUseCase {
	constructor(
		private readonly autorizacionRepository: AutorizacionRepository,
	) {}

	async ejecutar(id: number): Promise<void> {
		await this.autorizacionRepository.eliminar(id);
	}
}
