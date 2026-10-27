import { BaseError } from "@/core/shared/domain/error/BaseError";

/**
 * Error lanzado cuando un usuario no posee el permiso requerido.
 */
export class AccesoDenegadoError extends BaseError {
	constructor(recurso: string, accion: string) {
		super(
			`Acceso denegado: no tienes permiso para la acción "${accion}" sobre el recurso "${recurso}"`,
			403,
		);
	}
}
