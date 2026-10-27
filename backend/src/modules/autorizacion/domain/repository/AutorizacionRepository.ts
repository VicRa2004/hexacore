import type { Permiso } from "../Permiso";

/**
 * Puerto de repositorio para la autorización.
 * Define el contrato que la capa de infraestructura debe cumplir.
 *
 * Incluye el CRUD completo de Permiso y la resolución de permisos
 * efectivos por usuario (roles + excepciones directas).
 */
export interface AutorizacionRepository {
	// ── Consulta de permisos efectivos ─────────────────────────────────────────

	/**
	 * Retorna la lista de permisos efectivos de un usuario.
	 * La lógica de resolución (roles + excepciones directas) se implementa
	 * en la capa de infraestructura.
	 *
	 * @param usuarioId - ID del usuario a consultar
	 */
	obtenerPermisosEfectivos(usuarioId: number): Promise<Permiso[]>;

	// ── CRUD de permisos ────────────────────────────────────────────────────────

	/** Retorna todos los permisos registrados en el sistema. */
	buscarTodos(): Promise<Permiso[]>;

	/**
	 * Busca un permiso por su ID.
	 * @returns `Permiso` si existe, `null` si no.
	 */
	buscarPorId(id: number): Promise<Permiso | null>;

	/**
	 * Crea un nuevo permiso atómico (recurso + accion).
	 * @throws si la combinación recurso+accion ya existe.
	 */
	crear(recurso: string, accion: string): Promise<Permiso>;

	/**
	 * Actualiza recurso y/o accion de un permiso existente.
	 * @returns El permiso actualizado.
	 */
	actualizar(id: number, recurso: string, accion: string): Promise<Permiso>;

	/**
	 * Marca el permiso como inactivo (soft-delete lógico).
	 */
	eliminar(id: number): Promise<void>;
}
