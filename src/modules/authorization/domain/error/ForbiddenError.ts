import { BaseError } from "@/core/shared/domain/error/BaseError";

/**
 * Error lanzado cuando un usuario no posee el permiso requerido.
 */
export class ForbiddenError extends BaseError {
  constructor(resource: string, action: string) {
    super(
      `Acceso denegado: no tienes permiso para ejecutar la acción "${action}" sobre el recurso "${resource}"`,
      403,
    );
  }
}
