import { ValueObject } from "@/core/shared/domain/ValueObject";
import { UsuarioInvalidoError } from "../error/UsuarioInvalidoError";

export class Email extends ValueObject<string> {
	constructor(value: string) {
		if (!value.includes("@")) {
			throw new UsuarioInvalidoError("Formato de email inválido.");
		}
		super(value);
	}
}
