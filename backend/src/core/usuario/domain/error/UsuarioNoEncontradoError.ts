import { BaseError } from "@/core/shared/domain/error/BaseError";

export class UsuarioNoEncontradoError extends BaseError {
	constructor() {
		super("Usuario no encontrado", 404);
	}
}
