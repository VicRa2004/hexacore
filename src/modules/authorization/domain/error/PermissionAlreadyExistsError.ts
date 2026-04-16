import { BaseError } from "@/core/shared/domain/error/BaseError";

/**
 * Error lanzado cuando se intenta crear un permiso cuya combinación
 * resource+action ya existe en el sistema.
 */
export class PermissionAlreadyExistsError extends BaseError {
  constructor(resource: string, action: string) {
    super(
      `Ya existe un permiso para el recurso "${resource}" con la acción "${action}".`,
      409,
    );
  }
}
