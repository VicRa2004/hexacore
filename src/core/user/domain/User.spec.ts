import { describe, expect, it } from "bun:test";
import { User } from "./User";
import { CreateUserEvent } from "./event/CreateUserEvent";
import type { RoleType } from "./value-objects/Role";

describe("User Entity", () => {
  const userData = {
    name: "John Doe",
    email: "john@example.com",
    passwordHash: "hashed_password",
    role: "USER" as RoleType,
  };

  it("debería crear un usuario nuevo correctamente usando User.create", () => {
    const user = User.create(
      userData.name,
      userData.email,
      userData.passwordHash,
      userData.role,
    );

    expect(user.getName()).toBe(userData.name);
    expect(user.getEmail()).toBe(userData.email);
    expect(user.getPasswordHash()).toBe(userData.passwordHash);
    expect(user.getRole()).toBe(userData.role);
    expect(user.getIsActive()).toBe(true);
  });

  it("debería reconstituir un usuario correctamente usando User.reconstitute", () => {
    const id = 123;
    const isActive = false;
    const user = User.reconstitute(
      userData.name,
      userData.email,
      userData.passwordHash,
      isActive,
      id,
      userData.role,
    );

    expect(user.getId()).toBe(id);
    expect(user.getName()).toBe(userData.name);
    expect(user.getEmail()).toBe(userData.email);
    expect(user.getIsActive()).toBe(isActive);
  });

  it("debería desactivar un usuario cuando se llama a deactivate()", () => {
    const user = User.create(
      userData.name,
      userData.email,
      userData.passwordHash,
    );
    expect(user.getIsActive()).toBe(true);

    user.deactivate();
    expect(user.getIsActive()).toBe(false);
  });

  it("debería añadir un evento de creación al llamar a addCreateEvent()", () => {
    const id = 123;
    const isActive = false;

    const user = User.reconstitute(
      userData.name,
      userData.email,
      userData.passwordHash,
      isActive,
      id,
      userData.role,
    );
    user.addCreateEvent();

    const events = user.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(CreateUserEvent);
  });
});
