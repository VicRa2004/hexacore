import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
	registroApiMock,
	navigateMock,
	toastSuccessMock,
	toastErrorMock,
	clearMock,
} = vi.hoisted(() => ({
	registroApiMock: vi.fn(),
	navigateMock: vi.fn(),
	toastSuccessMock: vi.fn(),
	toastErrorMock: vi.fn(),
	clearMock: vi.fn(),
}));

vi.mock("../api/authApi", () => ({
	authApi: {
		registro: registroApiMock,
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
import { RegistroForm } from "./RegistroForm";

describe("RegistroForm", () => {
	beforeEach(() => {
		registroApiMock.mockReset();
		navigateMock.mockReset();
		toastSuccessMock.mockReset();
		toastErrorMock.mockReset();
		clearMock.mockReset();
		useAuthStore.getState().logout();
	});

	it("debería validar con Zod nombre, email y requisitos de contraseña antes de enviar", async () => {
		const user = userEvent.setup();
		render(<RegistroForm />);

		await user.type(screen.getByLabelText("Nombre Completo"), "A");
		await user.type(screen.getByLabelText("Correo Electrónico"), "invalido");
		await user.type(screen.getByLabelText("Contraseña"), "corta");
		await user.click(screen.getByRole("button", { name: /Crear Cuenta/i }));

		expect(
			await screen.findByText("El nombre debe tener al menos 2 caracteres"),
		).toBeInTheDocument();
		expect(
			screen.getByText("Ingresa un correo electrónico válido"),
		).toBeInTheDocument();
		expect(
			screen.getByText("La contraseña debe tener al menos 12 caracteres"),
		).toBeInTheDocument();
		expect(registroApiMock).not.toHaveBeenCalled();
	});

	it("debería registrar al usuario y navegar al dashboard cuando los datos son válidos", async () => {
		const user = userEvent.setup();
		registroApiMock.mockResolvedValueOnce({
			accessToken: "jwt-registro",
			usuario: {
				id: 9,
				nombre: "Juan Pérez",
				email: "juan@ejemplo.com",
				isActivo: true,
				emailVerificado: false,
				avatarUrl: null,
				roles: ["USUARIO"],
			},
		});
		render(<RegistroForm />);

		await user.type(screen.getByLabelText("Nombre Completo"), "Juan Pérez");
		await user.type(
			screen.getByLabelText("Correo Electrónico"),
			"juan@ejemplo.com",
		);
		await user.type(screen.getByLabelText("Contraseña"), "SecurePass123!");
		await user.click(screen.getByRole("button", { name: /Crear Cuenta/i }));

		await waitFor(() => {
			expect(registroApiMock).toHaveBeenCalledWith({
				nombre: "Juan Pérez",
				email: "juan@ejemplo.com",
				password: "SecurePass123!",
			});
		});

		expect(useAuthStore.getState().isAuthenticated).toBe(true);
		expect(toastSuccessMock).toHaveBeenCalledWith(
			"¡Cuenta creada con éxito! Bienvenido, Juan Pérez",
		);
		expect(navigateMock).toHaveBeenCalledWith({ to: "/dashboard" });
	});
});
