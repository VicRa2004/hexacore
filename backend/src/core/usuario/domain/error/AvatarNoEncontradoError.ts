import { BaseError } from "@/core/shared/domain/error/BaseError";

export class AvatarNoEncontradoError extends BaseError {
	constructor() {
		super("El usuario no tiene avatar", 404);
	}
}
