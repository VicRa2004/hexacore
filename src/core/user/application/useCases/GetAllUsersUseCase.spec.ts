import { describe, expect, it, mock, beforeEach } from "bun:test";
import { GetAllUsersUseCase } from "./GetAllUsersUseCase";
import { User } from "../../domain/User";

const mockUserRepository = {
  find: mock(),
};

describe("GetAllUsersUseCase", () => {
  let useCase: GetAllUsersUseCase;

  beforeEach(() => {
    mockUserRepository.find.mockClear();
    useCase = new GetAllUsersUseCase(mockUserRepository as any);
  });

  it("debería devolver una lista paginada de usuarios", async () => {
    const user = User.reconstitute(
      "John",
      "john@test.com",
      "hash",
      true,
      1,
      "USER",
    );
    mockUserRepository.find.mockResolvedValue({
      data: [user],
      total: 1,
      currentPage: 1,
      lastPage: 1,
    });

    const result = await useCase.run({ page: 1, limit: 10 });

    expect(result.data).toHaveLength(1);
    expect(result.data[0].email).toBe("john@test.com");
    expect(result.total).toBe(1);
    expect(mockUserRepository.find).toHaveBeenCalled();
  });

  it("debería devolver lista vacía si no hay usuarios", async () => {
    mockUserRepository.find.mockResolvedValue({
      data: [],
      total: 0,
      currentPage: 1,
      lastPage: 0,
    });

    const result = await useCase.run({ page: 1, limit: 10 });

    expect(result.data).toHaveLength(0);
  });
});
