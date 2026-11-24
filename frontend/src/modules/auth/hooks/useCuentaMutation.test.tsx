import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { crearQueryClientDeTest, crearWrapperQuery } from "@/test/utils";

const {
	listarSesionesMock,
	cerrarSesionMock,
	cambiarPasswordMock,
	navigateMock,
	toastSuccessMock,
	toastErrorMock,
	queryClearMock,
} = vi.hoisted(() => ({
	listarSesionesMock: vi.fn(),
	cerrarSesionMock: vi.fn(),
	cambiarPasswordMock: vi.fn(),
	navigateMock: vi.fn(),
	toastSuccessMock: vi.fn(),
	toastErrorMock: vi.fn(),
	queryClearMock: vi.fn(),
}));

vi.mock("../api/authApi", () => ({
	authApi: {
		listarSesiones: listarSesionesMock,
		cerrarSesion: cerrarSesionMock,
		cambiarPassword: cambiarPasswordMock,
		recuperarPassword: vi.fn(),
		restablecerPassword: vi.fn(),
		verificarEmail: vi.fn(),
		reenviarVerificacion: vi.fn(),
		cerrarSesiones: vi.fn(),
	},
}));

vi.mock("@tanstack/react-router", () => ({
	useNavigate: () => navigateMock,
}));

vi.mock("sonner", () => ({
	toast: {
		success: toastSuccessMock,
		error: toastErrorMock,
	},
}));

vi.mock("@/core/router", () => ({
	queryClient: { clear: queryClearMock },
}));

import { useAuthStore } from "@/core/auth/store";
import {
	useCambiarPasswordMutation,
	useCerrarSesionMutation,
	useSesionesQuery,
} from "./useCuentaMutation";

describe("hooks de cuenta y sesiones", () => {
	beforeEach(() => {
		listarSesionesMock.mockReset();
		cerrarSesionMock.mockReset();
		cambiarPasswordMock.mockReset();
		navigateMock.mockReset();
		toastSuccessMock.mockReset();
		toastErrorMock.mockReset();
		queryClearMock.mockReset();
		useAuthStore.getState().logout();
	});

	it("useSesionesQuery debería obtener la lista de sesiones activas", async () => {
		const sesiones = [
			{
				id: 1,
				userAgent: "Chrome/120",
				ip: "127.0.0.1",
				creadoEn: "2026-01-01T00:00:00.000Z",
				ultimoUso: "2026-01-01T01:00:00.000Z",
				actual: true,
			},
		];
		listarSesionesMock.mockResolvedValueOnce(sesiones);
		const queryClient = crearQueryClientDeTest();

		const { result } = renderHook(() => useSesionesQuery(), {
			wrapper: crearWrapperQuery(queryClient),
		});

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(listarSesionesMock).toHaveBeenCalledTimes(1);
		expect(result.current.data).toEqual(sesiones);
	});

	it("useCerrarSesionMutation debería mostrar toast e invalidar sesiones tras éxito o error", async () => {
		cerrarSesionMock
			.mockResolvedValueOnce({ mensaje: "Sesión cerrada" })
			.mockRejectedValueOnce(new Error("Sesión no encontrada"));
		const queryClient = crearQueryClientDeTest();
		const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

		const { result } = renderHook(() => useCerrarSesionMutation(), {
			wrapper: crearWrapperQuery(queryClient),
		});

		await act(async () => {
			await result.current.mutateAsync(5);
		});
		expect(cerrarSesionMock).toHaveBeenCalledWith(5, expect.anything());
		expect(toastSuccessMock).toHaveBeenCalledWith("Sesión cerrada");
		expect(invalidateSpy).toHaveBeenCalledWith({
			queryKey: ["auth", "sesiones"],
		});

		await act(async () => {
			await expect(result.current.mutateAsync(99)).rejects.toThrow(
				"Sesión no encontrada",
			);
		});
		expect(toastErrorMock).toHaveBeenCalledWith("Sesión no encontrada");
		expect(invalidateSpy).toHaveBeenCalledTimes(2);
	});

	it("useCambiarPasswordMutation debería actualizar tokens e invalidar sesiones", async () => {
		cambiarPasswordMock.mockResolvedValueOnce({ accessToken: "nuevo-jwt" });
		const queryClient = crearQueryClientDeTest();
		const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

		const { result } = renderHook(() => useCambiarPasswordMutation(), {
			wrapper: crearWrapperQuery(queryClient),
		});

		await act(async () => {
			await result.current.mutateAsync({
				passwordActual: "ViejaPass123!",
				passwordNueva: "NuevaPass123!",
			});
		});

		expect(useAuthStore.getState().accessToken).toBe("nuevo-jwt");
		expect(useAuthStore.getState().isAuthenticated).toBe(true);
		expect(invalidateSpy).toHaveBeenCalledWith({
			queryKey: ["auth", "sesiones"],
		});
		expect(toastSuccessMock).toHaveBeenCalledWith(
			"Contraseña cambiada. Se cerraron tus otras sesiones.",
		);
	});
});
