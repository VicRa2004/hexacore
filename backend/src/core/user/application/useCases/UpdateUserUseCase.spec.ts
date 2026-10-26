import { describe, expect, it, mock, beforeEach } from "bun:test";
import { UpdateUserUseCase } from "./UpdateUserUseCase";
import { User } from "../../domain/User";
import { UserNotFoundError } from "../../domain/error/UserNotFoundError";

const mockUserRepository = {
	findById: mock(),
	update: mock(),
};

const mockPasswordHasher = {
	hash: mock(),
	compare: mock(),
};

describe("UpdateUserUseCase", () => {
	let useCase: UpdateUserUseCase;

	beforeEach(() => {
		mockUserRepository.findById.mockClear();
		mockUserRepository.update.mockClear();
		mockPasswordHasher.hash.mockClear();
		useCase = new UpdateUserUseCase(
			mockUserRepository as never,
			mockPasswordHasher as never,
		);
	});

	it("debería actualizar el usuario si existe", async () => {
		const user = User.reconstitute(
			"John",
			"john@test.com",
			"hash",
			true,
			1,
			"USER",
		);
		mockUserRepository.findById.mockResolvedValue(user);
		mockUserRepository.update.mockImplementation(async (u: User) => u);

		const result = await useCase.run(1, { name: "John Updated" });

		expect(mockUserRepository.findById).toHaveBeenCalledWith(1);
		expect(result.id).toBe(1);
		expect(result.name).toBe("John Updated");
		expect(result.email).toBe("john@test.com");
		expect(mockPasswordHasher.hash).not.toHaveBeenCalled();
	});

	it("debería hashear la contraseña antes de guardarla", async () => {
		const user = User.reconstitute(
			"John",
			"john@test.com",
			"old_hash",
			true,
			1,
			"USER",
		);
		mockUserRepository.findById.mockResolvedValue(user);
		mockUserRepository.update.mockImplementation(async (u: User) => u);
		mockPasswordHasher.hash.mockResolvedValue("new_hash");

		await useCase.run(1, { password: "NewPassword123!" });

		const saved = mockUserRepository.update.mock.calls[0]?.[0] as User;
		expect(mockPasswordHasher.hash).toHaveBeenCalledWith("NewPassword123!");
		expect(saved.getPasswordHash()).toBe("new_hash");
	});

	it("debería lanzar UserNotFoundError si el usuario a actualizar no existe", async () => {
		mockUserRepository.findById.mockResolvedValue(null);

		expect(useCase.run(999, { name: "New Name" })).rejects.toThrow(
			UserNotFoundError,
		);
		expect(mockUserRepository.update).not.toHaveBeenCalled();
	});
});
