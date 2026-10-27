import { BaseError } from "@/core/shared/domain/error/BaseError";

/**
 * Error lanzado al eliminar un rol que todavía tiene usuarios asignados.
 */
export class RolEnUsoError extends BaseError {
	constructor(nombre: string) {
		super(
			`El rol "${nombre}" tiene usuarios asignados: quítaselo antes de eliminarlo.`,
			409,
		);
	}
}
