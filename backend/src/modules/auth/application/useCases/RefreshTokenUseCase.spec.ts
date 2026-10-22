import "reflect-metadata";
import { describe, expect, it, mock, beforeEach } from "bun:test";
import { RefreshTokenUseCase } from "./RefreshTokenUseCase";
import { SessionIssuer } from "../services/SessionIssuer";
import { User } from "@/core/user";

const mockTokenService = {
	generateToken: mock(() => "access"),
	generateRefreshToken: mock(() => "new_refresh"),
	hashRefreshToken: mock(() => "hash"),
};

const mockRefreshTokenRepo = {
	create: mock(),
	findValidByHash: mock(),
	findByHash: mock(),
	revokeById: mock(),
	revokeAllByUserId: mock(),
};

const mockUserRepository = {
	findById: mock(),
};

describe("RefreshTokenUseCase", () => {
	let useCase: RefreshTokenUseCase;

	beforeEach(() => {
		for (const fn of Object.values(mockRefreshTokenRepo)) fn.mockReset();
		mockUserRepository.findById.mockReset();
		mockRefreshTokenRepo.findValidByHash.mockResolvedValue({
			id: 1,
			userId: 5,
			expiresAt: new Date(Date.now() + 60_000),
		});
		useCase = new RefreshTokenUseCase(
			mockTokenService as any,
			mockRefreshTokenRepo as any,
			mockUserRepository as any,
			new SessionIssuer(mockTokenService as any, mockRefreshTokenRepo as any),
		);
	});

	it("debería rotar el token y emitir un nuevo par", async () => {
		mockRefreshTokenRepo.revokeById.mockResolvedValue(true);
		mockUserRepository.findById.mockResolvedValue(
			User.reconstitute("Ana", "a@x.com", "hash", true, 5, ["USER"]),
		);

		const result = await useCase.run("refresh");

		expect(result.refreshToken).toBe("new_refresh");
		expect(mockRefreshTokenRepo.create).toHaveBeenCalledTimes(1);
	});

	it("no debería emitir una segunda sesión si otra petición ya rotó el token", async () => {
		mockRefreshTokenRepo.revokeById.mockResolvedValue(false);

		expect(useCase.run("refresh")).rejects.toThrow(
			"Invalid or expired refresh token",
		);
		expect(mockRefreshTokenRepo.create).not.toHaveBeenCalled();
	});

	it("debería rechazar a un usuario desactivado", async () => {
		mockRefreshTokenRepo.revokeById.mockResolvedValue(true);
		mockUserRepository.findById.mockResolvedValue(
			User.reconstitute("Ana", "a@x.com", "hash", false, 5, ["USER"]),
		);

		expect(useCase.run("refresh")).rejects.toThrow("inactive");
		expect(mockRefreshTokenRepo.create).not.toHaveBeenCalled();
	});
});
