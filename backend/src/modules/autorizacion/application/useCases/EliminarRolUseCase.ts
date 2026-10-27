import type { RolRepository } from "../../domain/repository/RolRepository";

/**
 * Caso de uso: Elimina un rol sin usuarios asignados.
 *
 * @throws {RolNoEncontradoError} si el rol no existe.
 * @throws {RolEnUsoError} si algún usuario tiene el rol.
 * @method ejecutar - método principal obligatorio por convención del proyecto
 */
export class EliminarRolUseCase {
	constructor(private readonly rolRepository: RolRepository) {}

	async ejecutar(id: number): Promise<void> {
		await this.rolRepository.eliminar(id);
	}
}
