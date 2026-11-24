import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderConQueryClient } from "@/test/utils";

const {
	cambiarPasswordMock,
	toastSuccessMock,
	toastErrorMock,
	clearMock,
	navigateMock,
} = vi.hoisted(() => ({
	cambiarPasswordMock: vi.fn(),
	toastSuccessMock: vi.fn(),
	toastErrorMock: vi.fn(),
	clearMock: vi.fn(),
	navigateMock: vi.fn(),
}));

vi.mock("../api/authApi", () => ({
	authApi: {
		cambiarPassword: cambiarPasswordMock,
		recuperarPassword: vi.fn(),
		restablecerPassword: vi.fn(),
		verificarEmail: vi.fn(),
		reenviarVerificacion: vi.fn(),
		cerrarSesiones: vi.fn(),
		listarSesiones: vi.fn(),
		cerrarSesion: vi.fn(),
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
import { CambiarPasswordForm } from "./CambiarPasswordForm";

describe("CambiarPasswordForm", () => {
	beforeEach(() => {
		cambiarPasswordMock.mockReset();
		toastSuccessMock.mockReset();
		toastErrorMock.mockReset();
		clearMock.mockReset();
		navigateMock.mockReset();
		useAuthStore.getState().logout();
	});

	it("debería validar que las contraseñas coincidan y cumplan la política de seguridad", async () => {
		const user = userEvent.setup();
		renderConQueryClient(<CambiarPasswordForm />);

		await user.type(
			screen.getByLabelText("Contraseña actual"),
			"ActualPass123!",
		);
		await user.type(screen.getByLabelText("Nueva contraseña"), "NuevaPass123!");
		await user.type(screen.getByLabelText("Repite la nueva"), "Diferente123!");
		await user.click(
			screen.getByRole("button", { name: /Cambiar contraseña/i }),
		);

		expect(
			await screen.findByText("Las contraseñas no coinciden"),
		).toBeInTheDocument();
		expect(cambiarPasswordMock).not.toHaveBeenCalled();
	});

	it("debería enviar el cambio de contraseña, actualizar el token y limpiar el formulario", async () => {
		const user = userEvent.setup();
		cambiarPasswordMock.mockResolvedValueOnce({
			accessToken: "jwt-actualizado",
		});
		renderConQueryClient(<CambiarPasswordForm />);

		const campoActual = screen.getByLabelText("Contraseña actual");
		const campoNueva = screen.getByLabelText("Nueva contraseña");
		const campoConfirmacion = screen.getByLabelText("Repite la nueva");

		await user.type(campoActual, "ActualPass123!");
		await user.type(campoNueva, "NuevaPass123!");
		await user.type(campoConfirmacion, "NuevaPass123!");
		await user.click(
			screen.getByRole("button", { name: /Cambiar contraseña/i }),
		);

		await waitFor(() => {
			expect(cambiarPasswordMock).toHaveBeenCalledWith(
				{
					passwordActual: "ActualPass123!",
					passwordNueva: "NuevaPass123!",
				},
				expect.anything(),
			);
		});

		expect(useAuthStore.getState().accessToken).toBe("jwt-actualizado");
		expect(toastSuccessMock).toHaveBeenCalledWith(
			"Contraseña cambiada. Se cerraron tus otras sesiones.",
		);
		await waitFor(() => {
			expect(campoActual).toHaveValue("");
			expect(campoNueva).toHaveValue("");
			expect(campoConfirmacion).toHaveValue("");
		});
	});
});
