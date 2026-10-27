import { UsuarioNoEncontradoError } from "@/core/usuario";
import type {
	AsignacionUsuario,
	RolRepository,
} from "../../domain/repository/RolRepository";

/**
 * Caso de uso: Devuelve los roles y permisos directos asignados a un usuario.
 *
 * @throws {UsuarioNoEncontradoError} si el usuario no existe.
 * @method ejecutar - método principal obligatorio por convención del proyecto
 */
export class ObtenerAsignacionUsuarioUseCase {
	constructor(private readonly rolRepository: RolRepository) {}

	async ejecutar(usuarioId: number): Promise<AsignacionUsuario> {
		const asignacion = await this.rolRepository.obtenerAsignacion(usuarioId);

		if (!asignacion) {
			throw new UsuarioNoEncontradoError();
		}

		return asignacion;
	}
}
