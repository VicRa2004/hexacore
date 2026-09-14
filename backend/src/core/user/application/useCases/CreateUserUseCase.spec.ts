import "reflect-metadata";
import { describe, expect, it, mock, beforeEach } from "bun:test";
import { CreateUserUseCase } from "./CreateUserUseCase";
import { User } from "../../domain/User";
import { BaseError } from "@/core/shared/domain/error/BaseError";

// Mocks
const mockUserRepository = {
  find: mock(),
  create: mock(),
  findById: mock(),
  update: mock(),
  delete: mock(),
};

const mockPasswordHasher = {
  hash: mock(),
  compare: mock(),
};

const mockEventBus = {
  publish: mock(),
  publishAll: mock(),
};

describe("CreateUserUseCase", () => {
  let useCase: CreateUserUseCase;

  beforeEach(() => {
    mockUserRepository.find.mockClear();
    mockUserRepository.create.mockClear();
    mockPasswordHasher.hash.mockClear();
    mockEventBus.publishAll.mockClear();

    useCase = new CreateUserUseCase(
      mockUserRepository as any,
      mockPasswordHasher as any,
      mockEventBus as any,
    );
  });

  it("debería crear un usuario exitosamente cuando los datos son válidos y el email no existe", async () => {
    // Arrange
    const dto = {
      id: 123,
      name: "Test User",
      email: "test@example.com",
      password: "securePassword123",
      role: "USER",
      isActive: true,
    };

    mockUserRepository.find.mockResolvedValue({
      data: [],
      total: 0,
      lastPage: 0,
      currentPage: 1,
    });
    mockPasswordHasher.hash.mockResolvedValue("hashed_password");

    const fakeUser = User.reconstitute(
      dto.name,
      dto.email,
      "hashed_password",
      dto.isActive,
      dto.id,
      dto.role,
    );
    mockUserRepository.create.mockResolvedValue(fakeUser);

    // Act
    const result = await useCase.run(dto);

    // Assert
    expect(mockUserRepository.find).toHaveBeenCalled();
    expect(mockPasswordHasher.hash).toHaveBeenCalledWith(dto.password);
    expect(mockUserRepository.create).toHaveBeenCalled();
    expect(mockEventBus.publishAll).toHaveBeenCalled();
    expect(result.email).toBe(dto.email);
    expect(result.name).toBe(dto.name);
  });

  it("debería lanzar BaseError (400) si el usuario ya existe", async () => {
    // Arrange
    const dto = {
      name: "Test User",
      email: "existing@example.com",
      password: "password",
    };

    const existingUser = User.create("Existing", dto.email, "hash");
    mockUserRepository.find.mockResolvedValue({
      data: [existingUser],
      total: 1,
    });

    // Act & Assert
    expect(useCase.run(dto)).rejects.toThrow(BaseError);
    expect(useCase.run(dto)).rejects.toThrow(
      "El usuario con este correo electrónico ya existe",
    );
    expect(mockUserRepository.create).not.toHaveBeenCalled();
  });
});
