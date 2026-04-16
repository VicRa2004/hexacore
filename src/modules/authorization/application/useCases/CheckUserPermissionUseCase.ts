import { injectable, inject } from "tsyringe";
import type { AuthorizationRepository } from "../../domain/repository/AuthorizationRepository";
import { ForbiddenError } from "../../domain/error/ForbiddenError";

/**
 * Caso de uso: Verifica si un usuario posee un permiso específico.
 *
 * Lanza ForbiddenError si el usuario no tiene el permiso requerido.
 * Diseñado para ser reutilizado tanto desde el middleware HTTP como
 * desde otros casos de uso internos.
 *
 * @method run - método principal obligatorio por convención del proyecto
 */
@injectable()
export class CheckUserPermissionUseCase {
  constructor(
    @inject("AuthorizationRepository")
    private readonly authorizationRepository: AuthorizationRepository,
  ) {}

  /**
   * @param userId   - ID del usuario autenticado
   * @param resource - Recurso a verificar (ej: "turnos")
   * @param action   - Acción a verificar (ej: "create")
   * @throws {ForbiddenError} si el usuario no posee el permiso
   */
  async run(userId: number, resource: string, action: string): Promise<void> {
    const effectivePermissions =
      await this.authorizationRepository.getEffectivePermissions(userId);

    const hasPermission = effectivePermissions.some((perm) =>
      perm.matches(resource, action),
    );

    if (!hasPermission) {
      throw new ForbiddenError(resource, action);
    }
  }
}
