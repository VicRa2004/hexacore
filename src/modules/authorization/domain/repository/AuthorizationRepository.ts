import type { Permission } from "../Permission";

/**
 * Puerto de repositorio para la autorización.
 * Define el contrato que la capa de infraestructura debe cumplir.
 *
 * El método central resuelve los permisos EFECTIVOS de un usuario,
 * combinando: permisos de sus roles + permisos directos (con posibilidad
 * de denegar via UserPermission.granted = false).
 */
export interface AuthorizationRepository {
  /**
   * Retorna la lista de permisos efectivos de un usuario.
   * La lógica de resolución (roles + excepciones directas) se implementa
   * en la capa de infraestructura.
   *
   * @param userId - ID del usuario a consultar
   */
  getEffectivePermissions(userId: number): Promise<Permission[]>;
}
