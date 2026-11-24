import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { crearQueryClientDeTest, crearWrapperQuery } from "@/test/utils";

const { obtenerUsuariosMock } = vi.hoisted(() => ({
	obtenerUsuariosMock: vi.fn(),
}));

vi.mock("../api/usuariosApi", () => ({
	usuariosApi: {
		obtenerUsuarios: obtenerUsuariosMock,
	},
}));

import { useUsuariosQuery } from "./useUsuariosQuery";

describe("useUsuariosQuery", () => {
	beforeEach(() => {
		obtenerUsuariosMock.mockReset();
	});

	it("debería obtener y devolver los usuarios paginados con los parámetros dados", async () => {
		const paginaMock = {
			datos: [
				{
					id: 1,
					nombre: "Ana",
					email: "ana@hexacore.io",
					isActivo: true,
					emailVerificado: true,
					avatarUrl: null,
					roles: ["ADMIN"],
				},
			],
			pagina: 2,
			totalElementos: 11,
			totalPaginas: 2,
		};
		obtenerUsuariosMock.mockResolvedValueOnce(paginaMock);
		const queryClient = crearQueryClientDeTest();
		const params = { pagina: 2, limite: 10, email: "ana" };

		const { result } = renderHook(() => useUsuariosQuery(params), {
			wrapper: crearWrapperQuery(queryClient),
		});

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(obtenerUsuariosMock).toHaveBeenCalledWith(params);
		expect(result.current.data).toEqual(paginaMock);
	});

	it("no debería ejecutar la consulta cuando enabled es false", () => {
		const queryClient = crearQueryClientDeTest();

		const { result } = renderHook(
			() => useUsuariosQuery({ pagina: 1 }, { enabled: false }),
			{ wrapper: crearWrapperQuery(queryClient) },
		);

		expect(result.current.fetchStatus).toBe("idle");
		expect(obtenerUsuariosMock).not.toHaveBeenCalled();
	});

	it("debería exponer el estado de error cuando falla la petición", async () => {
		obtenerUsuariosMock.mockRejectedValueOnce(new Error("Fallo de red"));
		const queryClient = crearQueryClientDeTest();

		const { result } = renderHook(() => useUsuariosQuery(), {
			wrapper: crearWrapperQuery(queryClient),
		});

		await waitFor(() => expect(result.current.isError).toBe(true));
		expect(result.current.error).toBeInstanceOf(Error);
	});
});
