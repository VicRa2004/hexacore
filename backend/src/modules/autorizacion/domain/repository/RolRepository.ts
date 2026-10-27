import type { Rol } from "../Rol";

/** Datos con los que se crea o se reemplaza un rol. */
export interface DatosRol {
	nombre: string;
	descripcion: string | null;
	permisoIds: number[];
}

/** Roles y permisos directos (conceder/denegar) asignados a un usuario. */
export interface AsignacionUsuario {
	rolIds: number[];
	permisosDirectos: { permisoId: number; concedido: boolean }[];
}

/**
 * Puerto de repositorio de roles y de su asignación a usuarios.
 */
export interface RolRepository {
	buscarTodos(): Promise<Rol[]>;

	/** @returns `Rol` si existe, `null` si no. */
	buscarPorId(id: number): Promise<Rol | null>;

	/**
	 * @throws {RolYaExisteError} si el nombre ya está en uso.
	 * @throws {PermisoNoEncontradoError} si algún permiso no existe.
	 */
	crear(datos: DatosRol): Promise<Rol>;

	/**
	 * Reemplaza nombre, descripción y permisos del rol.
	 * @throws {RolNoEncontradoError} | {RolYaExisteError} | {PermisoNoEncontradoError}
	 */
	actualizar(id: number, datos: DatosRol): Promise<Rol>;

	/** @throws {RolNoEncontradoError} | {RolEnUsoError} si tiene usuarios asignados. */
	eliminar(id: number): Promise<void>;

	/** @returns `null` si el usuario no existe. */
	obtenerAsignacion(usuarioId: number): Promise<AsignacionUsuario | null>;

	/**
	 * Reemplaza los roles y permisos directos del usuario de forma atómica.
	 * @throws {RolNoEncontradoError} | {PermisoNoEncontradoError}
	 */
	actualizarAsignacion(
		usuarioId: number,
		asignacion: AsignacionUsuario,
	): Promise<void>;
}
