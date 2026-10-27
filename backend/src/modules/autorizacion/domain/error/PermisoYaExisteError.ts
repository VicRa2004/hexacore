import { BaseError } from "@/core/shared/domain/error/BaseError";

/**
 * Error lanzado cuando se intenta crear un permiso cuya combinación
 * recurso+accion ya existe en el sistema.
 */
export class PermisoYaExisteError extends BaseError {
	constructor(recurso: string, accion: string) {
		super(
			`Ya existe el permiso "${accion}" sobre el recurso "${recurso}".`,
			409,
		);
	}
}
