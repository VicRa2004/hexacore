import "reflect-metadata";
import { describe, expect, it, mock, beforeEach } from "bun:test";
import { RegisterUseCase } from "./RegisterUseCase";
import { SessionIssuer } from "../services/SessionIssuer";
import { User } from "@/core/user";

const mockUserRepository = {
	findByEmail: mock(),
	create: mock(),
};

const mockPasswordHasher = {
	hash: mock(async () => "hashed"),
	compare: mock(),
};

const mockTokenService = {
	generateToken: mock(() => "access"),
	generateRefreshToken: mock(() => "refresh"),
	hashRefreshToken: mock(() => "refresh_hash"),
};

const mockRefreshTokenRepo = {
	create: mock(),
};

describe("RegisterUseCase", () => {
	let useCase: RegisterUseCase;

	beforeEach(() => {
		mockUserRepository.findByEmail.mockReset();
		mockUserRepository.create.mockReset();
		mockRefreshTokenRepo.create.mockClear();
		useCase = new RegisterUseCase(
			mockUserRepository as never,
			mockPasswordHasher as never,
			new SessionIssuer(
				mockTokenService as never,
				mockRefreshTokenRepo as never,
			),
		);
	});

	it("debería guardar el usuario con la contraseña hasheada y emitir la sesión", async () => {
		mockUserRepository.findByEmail.mockResolvedValue(null);
		mockUserRepository.create.mockImplementation(async (user: User) =>
			User.reconstitute(
				user.getName(),
				user.getEmail(),
				user.getPasswordHash(),
				true,
				7,
				["USER"],
			),
		);

		const result = await useCase.run({
			name: "Ana",
			email: "ana@x.com",
			password: "secreta123",
		});

		const saved = mockUserRepository.create.mock.calls[0]?.[0] as User;
		expect(saved.getPasswordHash()).toBe("hashed");
		expect(result).toMatchObject({
			accessToken: "access",
			refreshToken: "refresh",
			user: { id: 7, email: "ana@x.com" },
		});
		expect(mockRefreshTokenRepo.create).toHaveBeenCalled();
	});

	it("debería rechazar un email ya registrado sin crear sesión", async () => {
		mockUserRepository.findByEmail.mockResolvedValue(
			User.reconstitute("Ana", "ana@x.com", "hash", true, 7, ["USER"]),
		);

		await expect(
			useCase.run({ name: "Ana", email: "ana@x.com", password: "secreta123" }),
		).rejects.toThrow("User with this email already exists");
		expect(mockUserRepository.create).not.toHaveBeenCalled();
		expect(mockRefreshTokenRepo.create).not.toHaveBeenCalled();
	});
});
