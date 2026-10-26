import { describe, expect, it, mock, beforeEach } from "bun:test";
import { LoginUseCase } from "./LoginUseCase";
import { SessionIssuer } from "../services/SessionIssuer";
import { User } from "@/core/user";

const mockUserRepository = {
	findByEmail: mock(),
};

const mockPasswordHasher = {
	hash: mock(),
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

const buildUser = (isActive: boolean) =>
	User.reconstitute("Ana", "a@x.com", "hash", isActive, 5, ["USER"]);

describe("LoginUseCase", () => {
	let useCase: LoginUseCase;

	beforeEach(() => {
		mockUserRepository.findByEmail.mockReset();
		mockPasswordHasher.compare.mockReset();
		mockRefreshTokenRepo.create.mockClear();
		useCase = new LoginUseCase(
			mockUserRepository as never,
			mockPasswordHasher as never,
			new SessionIssuer(
				mockTokenService as never,
				mockRefreshTokenRepo as never,
			),
		);
	});

	it("debería buscar el usuario por email exacto y emitir la sesión", async () => {
		mockUserRepository.findByEmail.mockResolvedValue(buildUser(true));
		mockPasswordHasher.compare.mockResolvedValue(true);

		const result = await useCase.run({ email: "a@x.com", password: "pass" });

		expect(mockUserRepository.findByEmail).toHaveBeenCalledWith("a@x.com");
		expect(result.user.id).toBe(5);
		expect(mockRefreshTokenRepo.create).toHaveBeenCalled();
	});

	it("debería lanzar 401 si el email no existe, comparando igualmente el hash", async () => {
		mockUserRepository.findByEmail.mockResolvedValue(null);
		mockPasswordHasher.compare.mockResolvedValue(false);

		await expect(
			useCase.run({ email: "a@x.com", password: "pass" }),
		).rejects.toThrow("Invalid credentials");
		// bcrypt corre aunque el email no exista: misma latencia que un fallo de contraseña
		expect(mockPasswordHasher.compare).toHaveBeenCalledTimes(1);
	});

	it("debería rechazar a un usuario desactivado", async () => {
		mockUserRepository.findByEmail.mockResolvedValue(buildUser(false));
		mockPasswordHasher.compare.mockResolvedValue(true);

		expect(useCase.run({ email: "a@x.com", password: "pass" })).rejects.toThrow(
			"User is inactive",
		);
		expect(mockRefreshTokenRepo.create).not.toHaveBeenCalled();
	});
});
