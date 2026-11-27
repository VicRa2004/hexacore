import type { EventBus } from "@/core/shared/domain/events/EventBus";
import { UsuarioNoEncontradoError } from "@/core/usuario";
import { AsignacionUsuarioActualizadaEvent } from "../../domain/event/AsignacionUsuarioActualizadaEvent";
import type {
	AsignacionUsuario,
	RolRepository,
} from "../../domain/repository/RolRepository";

function serializarPermisosDirectos(
	permisos: AsignacionUsuario["permisosDirectos"],
): string[] {
	return permisos
		.map((permiso) => `${permiso.permisoId}:${permiso.concedido}`)
		.sort();
}

function permisosCambiaron(
	anteriores: AsignacionUsuario["permisosDirectos"],
	nuevos: AsignacionUsuario["permisosDirectos"],
): boolean {
	if (anteriores.length !== nuevos.length) return true;
	const listaAnterior = serializarPermisosDirectos(anteriores);
	const listaNueva = serializarPermisosDirectos(nuevos);
	return listaAnterior.some((item, idx) => item !== listaNueva[idx]);
}

/**
 * Caso de uso: Reemplaza los roles y permisos directos de un usuario.
 *
 * @throws {UsuarioNoEncontradoError} si el usuario no existe.
 * @throws {RolNoEncontradoError} | {PermisoNoEncontradoError} si algún ID no existe.
 * @method ejecutar - método principal obligatorio por convención del proyecto
 */
export class ActualizarAsignacionUsuarioUseCase {
	constructor(
		private readonly rolRepository: RolRepository,
		private readonly eventBus?: EventBus,
	) {}

	async ejecutar(
		usuarioId: number,
		asignacion: AsignacionUsuario,
	): Promise<AsignacionUsuario> {
		const anterior = await this.rolRepository.obtenerAsignacion(usuarioId);
		if (!anterior) {
			throw new UsuarioNoEncontradoError();
		}

		await this.rolRepository.actualizarAsignacion(usuarioId, asignacion);

		if (this.eventBus) {
			const rolesAnteriores = new Set(anterior.rolIds);
			const rolesNuevos = new Set(asignacion.rolIds);
			const idsAgregados = [...rolesNuevos].filter(
				(id) => !rolesAnteriores.has(id),
			);
			const idsQuitados = [...rolesAnteriores].filter(
				(id) => !rolesNuevos.has(id),
			);
			const permisosDirectosCambiados = permisosCambiaron(
				anterior.permisosDirectos,
				asignacion.permisosDirectos,
			);

			if (
				idsAgregados.length > 0 ||
				idsQuitados.length > 0 ||
				permisosDirectosCambiados
			) {
				const nombresPorId = new Map(
					(await this.rolRepository.buscarTodos()).map((rol) => [
						rol.getId(),
						rol.getNombre(),
					]),
				);
				await this.eventBus.publish(
					new AsignacionUsuarioActualizadaEvent({
						usuarioId,
						rolesAgregados: idsAgregados
							.map((id) => nombresPorId.get(id))
							.filter((nombre): nombre is string => Boolean(nombre)),
						rolesQuitados: idsQuitados
							.map((id) => nombresPorId.get(id))
							.filter((nombre): nombre is string => Boolean(nombre)),
						permisosDirectosCambiados,
					}),
				);
			}
		}

		return asignacion;
	}
}
