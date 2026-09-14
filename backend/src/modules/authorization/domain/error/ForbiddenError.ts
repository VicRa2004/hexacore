import { BaseError } from "@/core/shared/domain/error/BaseError";

/**
 * Error lanzado cuando un usuario no posee el permiso requerido.
 */
export class ForbiddenError extends BaseError {
	constructor(resource: string, action: string) {
		super(
			`Access denied: you do not have permission to execute action "${action}" on resource "${resource}"`,
			403,
		);
	}
}
