import { BaseError } from "@/core/shared/domain/error/BaseError";

/**
 * Error lanzado cuando no se encuentra un permiso con el ID indicado.
 */
export class PermisoNoEncontradoError extends BaseError {
	constructor(id: number) {
		super(`No se encontró el permiso con ID ${id}.`, 404);
	}
}
