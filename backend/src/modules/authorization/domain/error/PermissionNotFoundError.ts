import { BaseError } from "@/core/shared/domain/error/BaseError";

/**
 * Error lanzado cuando no se encuentra un permiso con el ID indicado.
 */
export class PermissionNotFoundError extends BaseError {
  constructor(id: number) {
    super(`El permiso con ID ${id} no existe.`, 404);
  }
}
