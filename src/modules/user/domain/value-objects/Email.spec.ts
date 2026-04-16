import { describe, expect, it } from "bun:test";
import { Email } from "./Email";
import { UserValidationError } from "../error/UserValidationError";

describe("Email Value Object", () => {
  it("debería crear un email válido si contiene '@'", () => {
    const emailStr = "test@example.com";
    const email = new Email(emailStr);
    expect(email.value).toBe(emailStr);
  });

  it("debería lanzar UserValidationError si el formato es inválido (sin '@')", () => {
    const invalidEmail = "testexample.com";
    expect(() => new Email(invalidEmail)).toThrow(UserValidationError);
    expect(() => new Email(invalidEmail)).toThrow("El formato del correo es inválido.");
  });
});
