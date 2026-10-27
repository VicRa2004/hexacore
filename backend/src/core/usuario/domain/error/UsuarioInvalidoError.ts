import { BaseError } from "@/core/shared/domain/error/BaseError";

export class UsuarioInvalidoError extends BaseError {
	constructor(message?: string) {
		super(message || "Usuario inválido", 400);
	}
}
