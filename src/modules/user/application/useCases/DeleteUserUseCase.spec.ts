import { describe, expect, it, mock, beforeEach } from "bun:test";
import { DeleteUserUseCase } from "./DeleteUserUseCase";
import { User } from "../../domain/User";
import { UserNotFoundError } from "../../domain/error/UserNotFoundError";

const mockUserRepository = {
  findById: mock(),
  delete: mock(),
};

describe("DeleteUserUseCase", () => {
  let useCase: DeleteUserUseCase;

  beforeEach(() => {
    mockUserRepository.findById.mockClear();
    mockUserRepository.delete.mockClear();
    useCase = new DeleteUserUseCase(mockUserRepository as any);
  });

  it("debería borrar el usuario si existe", async () => {
    const user = User.reconstitute("John", "john@test.com", "hash", true, 1, "USER");
    mockUserRepository.findById.mockResolvedValue(user);
    mockUserRepository.delete.mockResolvedValue(undefined);

    await useCase.run(1);

    expect(mockUserRepository.findById).toHaveBeenCalledWith(1);
    expect(mockUserRepository.delete).toHaveBeenCalledWith(1);
  });

  it("debería lanzar UserNotFoundError si el usuario a borrar no existe", async () => {
    mockUserRepository.findById.mockResolvedValue(null);

    expect(useCase.run(999)).rejects.toThrow(UserNotFoundError);
    expect(mockUserRepository.delete).not.toHaveBeenCalled();
  });
});
