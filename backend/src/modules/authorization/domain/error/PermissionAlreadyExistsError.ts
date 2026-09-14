import { BaseError } from "@/core/shared/domain/error/BaseError";

/**
 * Error lanzado cuando se intenta crear un permiso cuya combinación
 * resource+action ya existe en el sistema.
 */
export class PermissionAlreadyExistsError extends BaseError {
	constructor(resource: string, action: string) {
		super(
			`Permission for resource "${resource}" with action "${action}" already exists.`,
			409,
		);
	}
}
