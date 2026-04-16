import { describe, expect, it, mock, beforeEach } from "bun:test";
import { UpdateUserUseCase } from "./UpdateUserUseCase";
import { User } from "../../domain/User";
import { UserNotFoundError } from "../../domain/error/UserNotFoundError";

const mockUserRepository = {
  findById: mock(),
  update: mock(),
};

describe("UpdateUserUseCase", () => {
  let useCase: UpdateUserUseCase;

  beforeEach(() => {
    mockUserRepository.findById.mockClear();
    mockUserRepository.update.mockClear();
    useCase = new UpdateUserUseCase(mockUserRepository as any);
  });

  it("debería actualizar el usuario si existe", async () => {
    const user = User.reconstitute("John", "john@test.com", "hash", true, 1, "USER");
    mockUserRepository.findById.mockResolvedValue(user);
    mockUserRepository.update.mockResolvedValue(user);

    const result = await useCase.run(1, { name: "John Updated" });

    expect(mockUserRepository.findById).toHaveBeenCalledWith(1);
    expect(mockUserRepository.update).toHaveBeenCalled();
    expect(result.id).toBe(1);
  });

  it("debería lanzar UserNotFoundError si el usuario a actualizar no existe", async () => {
    mockUserRepository.findById.mockResolvedValue(null);

    expect(useCase.run(999, { name: "New Name" })).rejects.toThrow(UserNotFoundError);
    expect(mockUserRepository.update).not.toHaveBeenCalled();
  });
});
