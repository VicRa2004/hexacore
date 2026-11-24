import { screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderConQueryClient } from "@/test/utils";

const { canjearMock, navigateMock, toastSuccessMock, toastErrorMock } =
	vi.hoisted(() => ({
		canjearMock: vi.fn(),
		navigateMock: vi.fn(),
		toastSuccessMock: vi.fn(),
		toastErrorMock: vi.fn(),
	}));

vi.mock("../api/authApi", () => ({
	authApi: { canjearOAuth: canjearMock },
}));
vi.mock("@tanstack/react-router", () => ({
	useNavigate: () => navigateMock,
}));
vi.mock("@/core/router", () => ({ queryClient: { clear: vi.fn() } }));
vi.mock("sonner", () => ({
	toast: { success: toastSuccessMock, error: toastErrorMock },
}));

import { useAuthStore } from "@/core/auth/store";
import { OAuthCallback } from "./OAuthCallback";

const volverCon = (fragmento: string) =>
	window.history.replaceState(null, "", `/oauth-callback#${fragmento}`);

describe("OAuthCallback", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		useAuthStore.getState().logout();
	});

	it("canjea el código, guarda la sesión y lo quita de la URL", async () => {
		canjearMock.mockResolvedValue({
			accessToken: "access",
			usuario: { id: 1, nombre: "Ana" },
		});
		volverCon("codigo=abc");

		renderConQueryClient(<OAuthCallback />);

		await waitFor(() =>
			expect(navigateMock).toHaveBeenCalledWith({ to: "/dashboard" }),
		);
		expect(canjearMock).toHaveBeenCalledTimes(1);
		expect(canjearMock.mock.calls[0]?.[0]).toBe("abc");
		expect(useAuthStore.getState().accessToken).toBe("access");
		expect(window.location.hash).toBe("");
	});

	it("con 2FA pide el código", async () => {
		canjearMock.mockResolvedValue({ requiere2fa: true, token2fa: "t2" });
		volverCon("codigo=abc");

		renderConQueryClient(<OAuthCallback />);

		expect(
			await screen.findByRole("button", { name: /Verificar/i }),
		).toBeInTheDocument();
		expect(useAuthStore.getState().isAuthenticated).toBe(false);
	});

	it("muestra el error del backend y vuelve al login", async () => {
		volverCon("error=Se%20cancel%C3%B3%20el%20acceso");

		renderConQueryClient(<OAuthCallback />);

		await waitFor(() =>
			expect(toastErrorMock).toHaveBeenCalledWith("Se canceló el acceso"),
		);
		expect(navigateMock).toHaveBeenCalledWith({ to: "/login", replace: true });
		expect(canjearMock).not.toHaveBeenCalled();
	});

	it("tras vincular una cuenta vuelve al perfil", async () => {
		volverCon("vinculada=github");

		renderConQueryClient(<OAuthCallback />);

		await waitFor(() =>
			expect(navigateMock).toHaveBeenCalledWith({
				to: "/perfil",
				replace: true,
			}),
		);
		expect(toastSuccessMock).toHaveBeenCalledWith("Cuenta de GitHub vinculada");
	});
});
