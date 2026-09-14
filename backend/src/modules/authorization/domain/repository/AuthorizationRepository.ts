import type { Permission } from "../Permission";

/**
 * Puerto de repositorio para la autorización.
 * Define el contrato que la capa de infraestructura debe cumplir.
 *
 * Incluye el CRUD completo de Permission y la resolución de permisos
 * efectivos por usuario (roles + excepciones directas).
 */
export interface AuthorizationRepository {
	// ── Consulta de permisos efectivos ─────────────────────────────────────────

	/**
	 * Retorna la lista de permisos efectivos de un usuario.
	 * La lógica de resolución (roles + excepciones directas) se implementa
	 * en la capa de infraestructura.
	 *
	 * @param userId - ID del usuario a consultar
	 */
	getEffectivePermissions(userId: number): Promise<Permission[]>;

	// ── CRUD de permisos ────────────────────────────────────────────────────────

	/** Retorna todos los permisos registrados en el sistema. */
	findAll(): Promise<Permission[]>;

	/**
	 * Busca un permiso por su ID.
	 * @returns `Permission` si existe, `null` si no.
	 */
	findById(id: number): Promise<Permission | null>;

	/**
	 * Crea un nuevo permiso atómico (resource + action).
	 * @throws si la combinación resource+action ya existe.
	 */
	create(resource: string, action: string): Promise<Permission>;

	/**
	 * Actualiza resource y/o action de un permiso existente.
	 * @returns El permiso actualizado.
	 */
	update(id: number, resource: string, action: string): Promise<Permission>;

	/**
	 * Marca el permiso como inactivo (soft-delete lógico).
	 */
	delete(id: number): Promise<void>;
}
