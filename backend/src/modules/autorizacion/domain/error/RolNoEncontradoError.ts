import { BaseError } from "@/core/shared/domain/error/BaseError";

/**
 * Error lanzado cuando no se encuentra un rol con el ID indicado.
 */
export class RolNoEncontradoError extends BaseError {
	constructor(id: number) {
		super(`No se encontró el rol con ID ${id}.`, 404);
	}
}
