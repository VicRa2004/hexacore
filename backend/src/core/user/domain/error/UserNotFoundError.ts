import { BaseError } from "@/core/shared/domain/error/BaseError";

export class UserNotFoundError extends BaseError {
	constructor() {
		super("User not found", 404);
	}
}
