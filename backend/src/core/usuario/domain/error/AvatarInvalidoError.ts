import { BaseError } from "@/core/shared/domain/error/BaseError";

export class AvatarInvalidoError extends BaseError {
	constructor(message: string) {
		super(message, 400);
	}
}
