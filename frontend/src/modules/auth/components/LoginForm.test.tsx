import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
	loginApiMock,
	navigateMock,
	toastSuccessMock,
	toastErrorMock,
	clearMock,
} = vi.hoisted(() => ({
	loginApiMock: vi.fn(),
	navigateMock: vi.fn(),
	toastSuccessMock: vi.fn(),
	toastErrorMock: vi.fn(),
	clearMock: vi.fn(),
}));

vi.mock("../api/authApi", () => ({
	authApi: {
		login: loginApiMock,
	},
}));

vi.mock("@tanstack/react-router", () => ({
	useNavigate: () => navigateMock,
}));

vi.mock("@/core/router", () => ({
	queryClient: { clear: clearMock },
}));

vi.mock("sonner", () => ({
	toast: {
		success: toastSuccessMock,
		error: toastErrorMock,
	},
}));

import { useAuthStore } from "@/core/auth/store";
import { LoginForm } from "./LoginForm";

describe("LoginForm", () => {
	beforeEach(() => {
		loginApiMock.mockReset();
		navigateMock.mockReset();
		toastSuccessMock.mockReset();
		toastErrorMock.mockReset();
		clearMock.mockReset();
		useAuthStore.getState().logout();
	});

	it("debería mostrar errores de validación Zod y no enviar si los datos son inválidos", async () => {
		const user = userEvent.setup();
		render(<LoginForm />);

		await user.click(screen.getByRole("button", { name: /Iniciar Sesión/i }));

		expect(
			await screen.findByText("Ingresa un correo electrónico válido"),
		).toBeInTheDocument();
		expect(screen.getByText("La contraseña es requerida")).toBeInTheDocument();
		expect(loginApiMock).not.toHaveBeenCalled();
	});

	it("debería autenticar al usuario, guardar la sesión y navegar al dashboard", async () => {
		const user = userEvent.setup();
		const respuesta = {
			accessToken: "jwt-login",
			usuario: {
				id: 1,
				nombre: "Administrador",
				email: "admin@dev.com",
				isActivo: true,
				emailVerificado: true,
				avatarUrl: null,
				roles: ["ADMIN"],
			},
		};
		loginApiMock.mockResolvedValueOnce(respuesta);
		render(<LoginForm />);

		await user.type(
			screen.getByLabelText("Correo Electrónico"),
			"admin@dev.com",
		);
		await user.type(screen.getByLabelText("Contraseña"), "SecurePass123!");
		await user.click(screen.getByRole("button", { name: /Iniciar Sesión/i }));

		await waitFor(() => {
			expect(loginApiMock).toHaveBeenCalledWith({
				email: "admin@dev.com",
				password: "SecurePass123!",
			});
		});

		expect(useAuthStore.getState().isAuthenticated).toBe(true);
		expect(useAuthStore.getState().accessToken).toBe("jwt-login");
		expect(toastSuccessMock).toHaveBeenCalledWith(
			"¡Bienvenido de nuevo, Administrador!",
		);
		expect(navigateMock).toHaveBeenCalledWith({ to: "/dashboard" });
	});

	it("debería mostrar toast de error cuando fallan las credenciales", async () => {
		const user = userEvent.setup();
		loginApiMock.mockRejectedValueOnce(new Error("Credenciales incorrectas"));
		render(<LoginForm />);

		await user.type(
			screen.getByLabelText("Correo Electrónico"),
			"admin@dev.com",
		);
		await user.type(screen.getByLabelText("Contraseña"), "Incorrecta123!");
		await user.click(screen.getByRole("button", { name: /Iniciar Sesión/i }));

		await waitFor(() => {
			expect(toastErrorMock).toHaveBeenCalledWith("Credenciales incorrectas");
		});
		expect(useAuthStore.getState().isAuthenticated).toBe(false);
		expect(navigateMock).not.toHaveBeenCalled();
	});
});
