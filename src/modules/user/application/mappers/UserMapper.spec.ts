import { describe, expect, it } from "bun:test";
import { UserMapper } from "./UserMapper";
import { User } from "../../domain/User";

describe("UserMapper", () => {
  it("debería mapear una entidad User a un UserDto correctamente", () => {
    const user = User.reconstitute(
      "Jane Doe",
      "jane@example.com",
      "hash",
      true,
      456,
      "ADMIN"
    );

    const dto = UserMapper.toDto(user);

    expect(dto.id).toBe(456);
    expect(dto.name).toBe("Jane Doe");
    expect(dto.email).toBe("jane@example.com");
    expect(dto.isActive).toBe(true);
    expect(dto.role).toBe("ADMIN");
    // Verificamos que no incluya password u otros campos sensibles si existieran
    expect((dto as any).passwordHash).toBeUndefined();
  });
});
