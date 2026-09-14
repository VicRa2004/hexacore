import { ValueObject } from "@/core/shared/domain/ValueObject";
import { UserValidationError } from "../error/UserValidationError";

export class Email extends ValueObject<string> {
	constructor(value: string) {
		if (!value.includes("@")) {
			throw new UserValidationError("Invalid email format.");
		}
		super(value);
	}
}
