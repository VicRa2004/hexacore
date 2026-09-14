import { BaseError } from "@/core/shared/domain/error/BaseError";

export class UserValidationError extends BaseError {
  constructor(message?: string) {
    super(message || "User validation failed", 400);
  }
}
