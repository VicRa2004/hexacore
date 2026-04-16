import { describe, expect, it, mock, beforeEach } from "bun:test";
import { GetOneUserUseCase } from "./GetOneUserUseCase";
import { User } from "../../domain/User";
import { UserNotFoundError } from "../../domain/error/UserNotFoundError";

const mockUserRepository = {
  findById: mock(),
};

describe("GetOneUserUseCase", () => {
  let useCase: GetOneUserUseCase;

  beforeEach(() => {
    mockUserRepository.findById.mockClear();
    useCase = new GetOneUserUseCase(mockUserRepository as any);
  });

  it("debería devolver un UserDto si el usuario existe", async () => {
    const user = User.reconstitute("John", "john@test.com", "hash", true, 1, "USER");
    mockUserRepository.findById.mockResolvedValue(user);

    const result = await useCase.run({ id: 1 });

    expect(result.id).toBe(1);
    expect(result.email).toBe("john@test.com");
    expect(mockUserRepository.findById).toHaveBeenCalledWith(1);
  });

  it("debería lanzar UserNotFoundError si el usuario no existe", async () => {
    mockUserRepository.findById.mockResolvedValue(null);

    expect(useCase.run({ id: 999 })).rejects.toThrow(UserNotFoundError);
  });
});
