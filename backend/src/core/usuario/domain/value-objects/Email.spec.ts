import { describe, expect, it } from "bun:test";
import { Email } from "./Email";
import { UsuarioInvalidoError } from "../error/UsuarioInvalidoError";

describe("Email Value Object", () => {
	it("debería crear un email válido si contiene '@'", () => {
		const emailTexto = "test@example.com";
		const email = new Email(emailTexto);
		expect(email.value).toBe(emailTexto);
	});

	it("debería lanzar UsuarioInvalidoError si el formato es inválido (sin '@')", () => {
		const invalidEmail = "testexample.com";
		expect(() => new Email(invalidEmail)).toThrow(UsuarioInvalidoError);
		expect(() => new Email(invalidEmail)).toThrow("Formato de email inválido.");
	});
});
