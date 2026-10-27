import { BaseError } from "@/core/shared/domain/error/BaseError";

/**
 * Error lanzado cuando se intenta crear o renombrar un rol con un nombre ya usado.
 */
export class RolYaExisteError extends BaseError {
	constructor(nombre: string) {
		super(`Ya existe el rol "${nombre}".`, 409);
	}
}
