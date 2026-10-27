import { UsuarioNoEncontradoError } from "@/core/usuario";
import type {
	AsignacionUsuario,
	RolRepository,
} from "../../domain/repository/RolRepository";

/**
 * Caso de uso: Reemplaza los roles y permisos directos de un usuario.
 *
 * @throws {UsuarioNoEncontradoError} si el usuario no existe.
 * @throws {RolNoEncontradoError} | {PermisoNoEncontradoError} si algún ID no existe.
 * @method ejecutar - método principal obligatorio por convención del proyecto
 */
export class ActualizarAsignacionUsuarioUseCase {
	constructor(private readonly rolRepository: RolRepository) {}

	async ejecutar(
		usuarioId: number,
		asignacion: AsignacionUsuario,
	): Promise<AsignacionUsuario> {
		if (!(await this.rolRepository.obtenerAsignacion(usuarioId))) {
			throw new UsuarioNoEncontradoError();
		}

		await this.rolRepository.actualizarAsignacion(usuarioId, asignacion);
		return asignacion;
	}
}
