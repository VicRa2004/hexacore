import "reflect-metadata";
import { describe, it, expect, mock, beforeEach } from "bun:test";
import { GetAllPermissionsUseCase } from "./GetAllPermissionsUseCase";
import type { AuthorizationRepository } from "../../domain/repository/AuthorizationRepository";

import { Permission } from "../../domain/Permission";

describe("GetAllPermissionsUseCase", () => {
	let repository: AuthorizationRepository;
	let useCase: GetAllPermissionsUseCase;

	beforeEach(() => {
		repository = {
			findAll: mock(() => Promise.resolve([])),
		} as any;

		useCase = new GetAllPermissionsUseCase(repository);
	});

	it("debe retornar una lista de permisos mapeados a DTO", async () => {
		const mockPermissions = [
			Permission.reconstitute(1, "users", "read"),
			Permission.reconstitute(2, "users", "write"),
		];

		(repository.findAll as any).mockReturnValue(
			Promise.resolve(mockPermissions),
		);

		const result = await useCase.run();

		expect(repository.findAll).toHaveBeenCalled();
		expect(result).toHaveLength(2);
		expect(result[0]).toEqual({
			id: 1,
			resource: "users",
			action: "read",
		});
	});
});
