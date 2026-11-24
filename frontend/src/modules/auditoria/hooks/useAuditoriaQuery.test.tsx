import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { crearQueryClientDeTest, crearWrapperQuery } from "@/test/utils";

const { obtenerMock, exportarCsvMock, toastSuccessMock, toastErrorMock } =
	vi.hoisted(() => ({
		obtenerMock: vi.fn(),
		exportarCsvMock: vi.fn(),
		toastSuccessMock: vi.fn(),
		toastErrorMock: vi.fn(),
	}));

vi.mock("../api/auditoriaApi", () => ({
	auditoriaApi: {
		obtener: obtenerMock,
		exportarCsv: exportarCsvMock,
	},
}));

vi.mock("sonner", () => ({
	toast: {
		success: toastSuccessMock,
		error: toastErrorMock,
	},
}));

import {
	useAuditoriaQuery,
	useExportarAuditoriaMutation,
} from "./useAuditoriaQuery";

describe("hooks de auditoría", () => {
	beforeEach(() => {
		obtenerMock.mockReset();
		exportarCsvMock.mockReset();
		toastSuccessMock.mockReset();
		toastErrorMock.mockReset();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("useAuditoriaQuery", () => {
		it("debería obtener eventos de auditoría con los filtros indicados", async () => {
			const respuesta = {
				datos: [
					{
						id: 10,
						evento: "auth.login",
						usuarioId: 1,
						ip: "127.0.0.1",
						userAgent: "Test",
						metadatos: null,
						ocurridoEn: "2026-01-01T00:00:00.000Z",
					},
				],
				pagina: 1,
				totalElementos: 1,
				totalPaginas: 1,
			};
			obtenerMock.mockResolvedValueOnce(respuesta);
			const queryClient = crearQueryClientDeTest();
			const params = { pagina: 1, evento: "auth.login" };

			const { result } = renderHook(() => useAuditoriaQuery(params), {
				wrapper: crearWrapperQuery(queryClient),
			});

			await waitFor(() => expect(result.current.isSuccess).toBe(true));
			expect(obtenerMock).toHaveBeenCalledWith(params);
			expect(result.current.data).toEqual(respuesta);
		});

		it("no debería consultar cuando enabled es false", () => {
			const queryClient = crearQueryClientDeTest();

			renderHook(() => useAuditoriaQuery({}, { enabled: false }), {
				wrapper: crearWrapperQuery(queryClient),
			});

			expect(obtenerMock).not.toHaveBeenCalled();
		});
	});

	describe("useExportarAuditoriaMutation", () => {
		it("debería descargar el CSV, invalidar caché y mostrar toast de éxito", async () => {
			const blob = new Blob(["id,evento\n1,auth.login"], { type: "text/csv" });
			exportarCsvMock.mockResolvedValueOnce({
				blob,
				nombreArchivo: "auditoria-2026.csv",
			});

			const createObjectUrlSpy = vi
				.spyOn(URL, "createObjectURL")
				.mockReturnValue("blob:mock-url");
			const revokeObjectUrlSpy = vi
				.spyOn(URL, "revokeObjectURL")
				.mockImplementation(() => {});
			const clickSpy = vi
				.spyOn(HTMLAnchorElement.prototype, "click")
				.mockImplementation(() => {});

			const queryClient = crearQueryClientDeTest();
			const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

			const { result } = renderHook(() => useExportarAuditoriaMutation(), {
				wrapper: crearWrapperQuery(queryClient),
			});

			await act(async () => {
				await result.current.mutateAsync({ evento: "auth.login" });
			});

			expect(exportarCsvMock).toHaveBeenCalledWith({ evento: "auth.login" });
			expect(createObjectUrlSpy).toHaveBeenCalledWith(blob);
			expect(clickSpy).toHaveBeenCalledTimes(1);
			expect(revokeObjectUrlSpy).toHaveBeenCalledWith("blob:mock-url");
			expect(toastSuccessMock).toHaveBeenCalledWith(
				"Auditoría exportada en CSV",
			);
			expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["auditoria"] });
		});

		it("debería mostrar toast de error cuando falla la exportación", async () => {
			exportarCsvMock.mockRejectedValueOnce(new Error("Sin permisos"));
			const queryClient = crearQueryClientDeTest();

			const { result } = renderHook(() => useExportarAuditoriaMutation(), {
				wrapper: crearWrapperQuery(queryClient),
			});

			await act(async () => {
				await expect(result.current.mutateAsync({})).rejects.toThrow(
					"Sin permisos",
				);
			});

			expect(toastErrorMock).toHaveBeenCalledWith("Sin permisos");
		});
	});
});
