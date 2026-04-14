import { BaseError } from "@/core/shared/domain/error/BaseError";

export type RoleType = "USER" | "MOD" | "ADMIN";

const validRoles: RoleType[] = ["USER", "MOD", "ADMIN"];

export class Role {
  public readonly value: RoleType;

  constructor(value: string) {
    if (!this.isValid(value)) {
      throw new BaseError(`El rol '${value}' no es válido. Los roles admitidos son: ${validRoles.join(", ")}`, 400);
    }
    this.value = value as RoleType;
  }

  private isValid(value: string): boolean {
    return validRoles.includes(value as RoleType);
  }
}
