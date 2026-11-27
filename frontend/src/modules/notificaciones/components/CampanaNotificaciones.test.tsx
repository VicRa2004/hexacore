import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { crearQueryClientDeTest, crearWrapperQuery } from "@/test/utils";

const {
	useNotificacionesQueryMock,
	marcarLeidaMutateMock,
	marcarTodasMutateMock,
} = vi.hoisted(() => ({
	useNotificacionesQueryMock: vi.fn(),
	marcarLeidaMutateMock: vi.fn(),
	marcarTodasMutateMock: vi.fn(),
}));

vi.mock("../hooks/useNotificacionesQuery", () => ({
	useNotificacionesQuery: useNotificacionesQueryMock,
	useMarcarLeidaMutation: () => ({
		mutate: marcarLeidaMutateMock,
		isPending: false,
	}),
	useMarcarTodasLeidasMutation: () => ({
		mutate: marcarTodasMutateMock,
		isPending: false,
	}),
}));

import { CampanaNotificaciones } from "./CampanaNotificaciones";

describe("CampanaNotificaciones", () => {
	beforeEach(() => {
		useNotificacionesQueryMock.mockReset();
		marcarLeidaMutateMock.mockReset();
		marcarTodasMutateMock.mockReset();
	});

	it("se oculta cuando el módulo no está montado en backend (data === null)", () => {
		useNotificacionesQueryMock.mockReturnValue({
			data: null,
			isLoading: false,
			isError: false,
		});

		const { container } = render(<CampanaNotificaciones />, {
			wrapper: crearWrapperQuery(crearQueryClientDeTest()),
		});
		expect(container).toBeEmptyDOMElement();
	});

	it("muestra contador, lista de notificaciones y permite marcar una o todas", async () => {
		const user = userEvent.setup();
		useNotificacionesQueryMock.mockReturnValue({
			data: {
				datos: [
					{
						id: 11,
						tipo: "autorizacion.asignacion_actualizada",
						datos: {
							rolesAgregados: ["ADMIN"],
							rolesQuitados: [],
							permisosDirectosCambiados: false,
						},
						leida: false,
						leidaEn: null,
						createdAt: new Date().toISOString(),
					},
					{
						id: 10,
						tipo: "auth.password_cambiada",
						datos: { metodo: "cambio" },
						leida: true,
						leidaEn: new Date().toISOString(),
						createdAt: new Date().toISOString(),
					},
				],
				pagina: 1,
				totalElementos: 2,
				totalPaginas: 1,
				noLeidas: 1,
			},
			isLoading: false,
			isError: false,
		});

		render(<CampanaNotificaciones />, {
			wrapper: crearWrapperQuery(crearQueryClientDeTest()),
		});

		expect(
			screen.getByRole("button", { name: "Notificaciones (1 sin leer)" }),
		).toBeInTheDocument();
		expect(screen.getByText("Te asignaron el rol ADMIN")).toBeInTheDocument();
		expect(screen.getByText("Se cambió tu contraseña")).toBeInTheDocument();

		await user.click(screen.getByText("Te asignaron el rol ADMIN"));
		expect(marcarLeidaMutateMock).toHaveBeenCalledWith(11);

		await user.click(screen.getByRole("button", { name: /Marcar todas/i }));
		expect(marcarTodasMutateMock).toHaveBeenCalledTimes(1);
	});
});
