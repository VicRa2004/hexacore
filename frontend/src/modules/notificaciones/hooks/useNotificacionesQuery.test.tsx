import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { crearQueryClientDeTest, crearWrapperQuery } from "@/test/utils";

const {
	listarMock,
	marcarLeidaMock,
	marcarTodasLeidasMock,
	toastSuccessMock,
	toastErrorMock,
} = vi.hoisted(() => ({
	listarMock: vi.fn(),
	marcarLeidaMock: vi.fn(),
	marcarTodasLeidasMock: vi.fn(),
	toastSuccessMock: vi.fn(),
	toastErrorMock: vi.fn(),
}));

vi.mock("../api/notificacionesApi", () => ({
	notificacionesApi: {
		listar: listarMock,
		marcarLeida: marcarLeidaMock,
		marcarTodasLeidas: marcarTodasLeidasMock,
	},
}));

vi.mock("sonner", () => ({
	toast: {
		success: toastSuccessMock,
		error: toastErrorMock,
	},
}));

import {
	NOTIFICACIONES_QUERY_KEY,
	useMarcarLeidaMutation,
	useMarcarTodasLeidasMutation,
	useNotificacionesQuery,
} from "./useNotificacionesQuery";

describe("hooks de notificaciones", () => {
	beforeEach(() => {
		listarMock.mockReset();
		marcarLeidaMock.mockReset();
		marcarTodasLeidasMock.mockReset();
		toastSuccessMock.mockReset();
		toastErrorMock.mockReset();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("useNotificacionesQuery obtiene la página y noLeidas", async () => {
		const respuesta = {
			datos: [],
			pagina: 1,
			totalElementos: 0,
			totalPaginas: 0,
			noLeidas: 0,
		};
		listarMock.mockResolvedValueOnce(respuesta);
		const queryClient = crearQueryClientDeTest();

		const { result } = renderHook(() => useNotificacionesQuery(), {
			wrapper: crearWrapperQuery(queryClient),
		});

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(listarMock).toHaveBeenCalledWith({ pagina: 1, limite: 15 });
		expect(result.current.data).toEqual(respuesta);
	});

	it("useMarcarLeidaMutation invalida la caché al marcar", async () => {
		marcarLeidaMock.mockResolvedValueOnce({ id: 5, leida: true });
		const queryClient = crearQueryClientDeTest();
		const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

		const { result } = renderHook(() => useMarcarLeidaMutation(), {
			wrapper: crearWrapperQuery(queryClient),
		});

		await act(async () => {
			await result.current.mutateAsync(5);
		});

		expect(marcarLeidaMock).toHaveBeenCalledWith(5);
		expect(invalidateSpy).toHaveBeenCalledWith({
			queryKey: NOTIFICACIONES_QUERY_KEY,
		});
	});

	it("useMarcarTodasLeidasMutation invalida caché y muestra toast", async () => {
		marcarTodasLeidasMock.mockResolvedValueOnce({ actualizadas: 3 });
		const queryClient = crearQueryClientDeTest();
		const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

		const { result } = renderHook(() => useMarcarTodasLeidasMutation(), {
			wrapper: crearWrapperQuery(queryClient),
		});

		await act(async () => {
			await result.current.mutateAsync();
		});

		expect(invalidateSpy).toHaveBeenCalledWith({
			queryKey: NOTIFICACIONES_QUERY_KEY,
		});
		expect(toastSuccessMock).toHaveBeenCalledWith(
			"Notificaciones marcadas como leídas",
		);
	});
});
