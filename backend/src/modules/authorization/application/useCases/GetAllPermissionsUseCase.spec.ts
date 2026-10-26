import { describe, it, expect, mock, beforeEach, type Mock } from "bun:test";
import { GetAllPermissionsUseCase } from "./GetAllPermissionsUseCase";
import type { AuthorizationRepository } from "../../domain/repository/AuthorizationRepository";

import { Permission } from "../../domain/Permission";

describe("GetAllPermissionsUseCase", () => {
	let findAll: Mock<AuthorizationRepository["findAll"]>;
	let useCase: GetAllPermissionsUseCase;

	beforeEach(() => {
		findAll = mock(() => Promise.resolve([]));
		useCase = new GetAllPermissionsUseCase({ findAll } as never);
	});

	it("debe retornar una lista de permisos mapeados a DTO", async () => {
		const mockPermissions = [
			Permission.reconstitute(1, "users", "read"),
			Permission.reconstitute(2, "users", "write"),
		];

		findAll.mockResolvedValue(mockPermissions);

		const result = await useCase.run();

		expect(findAll).toHaveBeenCalled();
		expect(result).toHaveLength(2);
		expect(result[0]).toEqual({
			id: 1,
			resource: "users",
			action: "read",
		});
	});
});
