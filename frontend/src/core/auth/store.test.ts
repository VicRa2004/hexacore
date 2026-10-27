import { beforeEach, describe, expect, it, vi } from "vitest";

const { clear } = vi.hoisted(() => ({ clear: vi.fn() }));
vi.mock("@/core/router", () => ({ queryClient: { clear } }));

import { useAuthStore } from "./store";

const session = {
	accessToken: "access",
	usuario: { id: 1, nombre: "Ana", email: "a@x.com", roles: ["USUARIO"] },
};

describe("useAuthStore", () => {
	beforeEach(() => clear.mockClear());

	it("login guarda la sesión", () => {
		useAuthStore.getState().login(session as never);

		expect(useAuthStore.getState()).toMatchObject({
			accessToken: "access",
			isAuthenticated: true,
		});
	});

	it("logout borra la sesión y la caché de queries", () => {
		useAuthStore.getState().login(session as never);
		useAuthStore.getState().logout();

		expect(useAuthStore.getState()).toMatchObject({
			usuario: null,
			accessToken: null,
			isAuthenticated: false,
		});
		expect(clear).toHaveBeenCalledTimes(1);
	});
});
