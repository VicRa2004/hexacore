import { describe, expect, it } from "bun:test";
import { Role } from "./Role";
import { BaseError } from "@/core/shared/domain/error/BaseError";

describe("Role Value Object", () => {
  it("debería permitir crear un rol 'USER'", () => {
    const role = new Role("USER");
    expect(role.value).toBe("USER");
  });

  it("debería permitir crear un rol 'ADMIN'", () => {
    const role = new Role("ADMIN");
    expect(role.value).toBe("ADMIN");
  });

  it("debería permitir crear un rol 'MOD'", () => {
    const role = new Role("MOD");
    expect(role.value).toBe("MOD");
  });

  it("debería lanzar BaseError si el rol no es válido", () => {
    const invalidRole = "SUPER_ADMIN";
    expect(() => new Role(invalidRole)).toThrow(BaseError);
    expect(() => new Role(invalidRole)).toThrow(/no es válido/);
  });
});
