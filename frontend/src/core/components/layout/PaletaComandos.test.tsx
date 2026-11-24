import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/core/auth/store";

const {
	navigateMock,
	puedeMock,
	useUsuariosQueryMock,
	logoutApiMock,
	cambiarTemaMock,
	cambiarAcentoMock,
	toastInfoMock,
} = vi.hoisted(() => ({
	navigateMock: vi.fn(),
	puedeMock: vi.fn<(permiso: string) => boolean>(),
	useUsuariosQueryMock: vi.fn(),
	logoutApiMock: vi.fn(),
	cambiarTemaMock: vi.fn(),
	cambiarAcentoMock: vi.fn(),
	toastInfoMock: vi.fn(),
}));

vi.mock("@tanstack/react-router", () => ({
	Link: ({ children }: { children: unknown }) => children,
	useNavigate: () => navigateMock,
}));

vi.mock("@/core/auth/permisos", () => ({
	usePermisos: () => ({ puede: puedeMock }),
}));

vi.mock("@/modules/usuarios/hooks/useUsuariosQuery", () => ({
	useUsuariosQuery: useUsuariosQueryMock,
}));

vi.mock("@/modules/auth/api/authApi", () => ({
	authApi: {
		logout: logoutApiMock,
	},
}));

vi.mock("@/core/tema", () => ({
	ACENTOS: {
		indigo: 277,
		violeta: 300,
		azul: 250,
		cian: 215,
		esmeralda: 160,
		rosa: 350,
	},
	cambiarTema: cambiarTemaMock,
	cambiarAcento: cambiarAcentoMock,
	useTema: () => ({ preferencia: "sistema", efectivo: "claro" }),
	useAcento: () => "indigo",
}));

vi.mock("sonner", () => ({
	toast: {
		info: toastInfoMock,
		success: vi.fn(),
		error: vi.fn(),
	},
}));

import { PaletaComandos } from "./PaletaComandos";

function PaletaHost({ abiertoInicial = false }: { abiertoInicial?: boolean }) {
	const [abierto, setAbierto] = useState(abiertoInicial);
	return (
		<div>
			<span data-testid="estado">{abierto ? "abierto" : "cerrado"}</span>
			<PaletaComandos
				abierto={abierto}
				onCerrar={() => setAbierto(false)}
				onAlternar={() => setAbierto((v) => !v)}
			/>
		</div>
	);
}

describe("PaletaComandos", () => {
	beforeEach(() => {
		navigateMock.mockReset();
		puedeMock.mockReset().mockReturnValue(true);
		useUsuariosQueryMock.mockReset().mockReturnValue({
			data: undefined,
			isFetching: false,
		});
		logoutApiMock.mockReset().mockResolvedValue(undefined);
		cambiarTemaMock.mockReset();
		cambiarAcentoMock.mockReset();
		toastInfoMock.mockReset();

		useAuthStore.setState({
			usuario: {
				id: 1,
				nombre: "Admin",
				email: "admin@hexacore.io",
				isActivo: true,
				emailVerificado: true,
				avatarUrl: null,
				roles: ["ADMIN"],
			},
			accessToken: "token-prueba",
			isAuthenticated: true,
		});
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("abre y alterna con Ctrl+K y Cmd+K, y no se abre sobre otro diálogo abierto", () => {
		render(<PaletaHost />);
		expect(screen.getByTestId("estado")).toHaveTextContent("cerrado");

		fireEvent.keyDown(window, { key: "k", ctrlKey: true });
		expect(screen.getByTestId("estado")).toHaveTextContent("abierto");
		expect(screen.getByRole("combobox")).toHaveFocus();

		fireEvent.keyDown(window, { key: "k", metaKey: true });
		expect(screen.getByTestId("estado")).toHaveTextContent("cerrado");

		// Otro diálogo abierto impide que Ctrl+K abra la paleta encima.
		const otroDialogo = document.createElement("dialog");
		otroDialogo.setAttribute("open", "");
		document.body.appendChild(otroDialogo);
		try {
			fireEvent.keyDown(window, { key: "k", ctrlKey: true });
			expect(screen.getByTestId("estado")).toHaveTextContent("cerrado");
		} finally {
			otroDialogo.remove();
		}
	});

	it("filtra secciones y acciones según los permisos del usuario", () => {
		puedeMock.mockImplementation((permiso) => permiso === "usuarios:leer");
		render(<PaletaHost abiertoInicial />);

		const listbox = screen.getByRole("listbox");
		expect(
			within(listbox).getByRole("option", { name: /Dashboard/i }),
		).toBeInTheDocument();
		expect(
			within(listbox).getByRole("option", { name: /Usuarios/i }),
		).toBeInTheDocument();
		expect(
			within(listbox).queryByRole("option", { name: /Roles/i }),
		).not.toBeInTheDocument();
		expect(
			within(listbox).queryByRole("option", { name: /Auditoría/i }),
		).not.toBeInTheDocument();
		expect(
			within(listbox).queryByRole("option", { name: /Nuevo usuario/i }),
		).not.toBeInTheDocument();
		expect(
			within(listbox).queryByRole("option", { name: /Nuevo rol/i }),
		).not.toBeInTheDocument();
		expect(
			within(listbox).getByRole("option", { name: /Cerrar sesión/i }),
		).toBeInTheDocument();
	});

	it("navega por teclado actualizando aria-activedescendant y ejecuta con Enter", async () => {
		const user = userEvent.setup();
		puedeMock.mockImplementation((permiso) => permiso === "usuarios:leer");
		render(<PaletaHost abiertoInicial />);

		const combobox = screen.getByRole("combobox");
		const opciones = screen.getAllByRole("option");

		expect(combobox).toHaveAttribute("aria-expanded", "true");
		expect(combobox).toHaveAttribute("aria-activedescendant", opciones[0]?.id);
		expect(opciones[0]).toHaveAttribute("aria-selected", "true");

		await user.keyboard("{ArrowDown}");
		expect(combobox).toHaveAttribute("aria-activedescendant", opciones[1]?.id);
		expect(opciones[1]).toHaveAttribute("aria-selected", "true");
		expect(opciones[0]).toHaveAttribute("aria-selected", "false");

		// ArrowUp desde el primero salta al último (ciclo).
		await user.keyboard("{ArrowUp}{ArrowUp}");
		const ultima = opciones[opciones.length - 1];
		expect(combobox).toHaveAttribute("aria-activedescendant", ultima?.id);
		expect(ultima).toHaveAttribute("aria-selected", "true");

		// Volvemos al segundo (Usuarios) y ejecutamos con Enter.
		await user.keyboard("{ArrowDown}{ArrowDown}{Enter}");
		expect(navigateMock).toHaveBeenCalledWith({ to: "/usuarios" });
		expect(screen.getByTestId("estado")).toHaveTextContent("cerrado");
	});

	it("ejecuta acciones rápidas: nuevo usuario, nuevo rol, tema, acento y cerrar sesión", async () => {
		const user = userEvent.setup();
		render(<PaletaHost abiertoInicial />);

		await user.click(screen.getByRole("option", { name: /Nuevo usuario/i }));
		expect(navigateMock).toHaveBeenCalledWith({
			to: "/usuarios",
			search: { accion: "crear" },
		});

		fireEvent.keyDown(window, { key: "k", ctrlKey: true });
		await user.click(screen.getByRole("option", { name: /Nuevo rol/i }));
		expect(navigateMock).toHaveBeenCalledWith({
			to: "/roles",
			search: { accion: "crear" },
		});

		fireEvent.keyDown(window, { key: "k", ctrlKey: true });
		await user.click(screen.getByRole("option", { name: /Tema oscuro/i }));
		expect(cambiarTemaMock).toHaveBeenCalledWith("oscuro");

		fireEvent.keyDown(window, { key: "k", ctrlKey: true });
		await user.click(
			screen.getByRole("option", { name: /Color de acento: Esmeralda/i }),
		);
		expect(cambiarAcentoMock).toHaveBeenCalledWith("esmeralda");

		fireEvent.keyDown(window, { key: "k", ctrlKey: true });
		await user.click(screen.getByRole("option", { name: /Cerrar sesión/i }));
		expect(logoutApiMock).toHaveBeenCalledTimes(1);
		expect(useAuthStore.getState().isAuthenticated).toBe(false);
		expect(navigateMock).toHaveBeenCalledWith({ to: "/login" });
	});

	it("busca usuarios por email tras debounce cuando hay >= 2 caracteres y permiso", async () => {
		vi.useFakeTimers();
		useUsuariosQueryMock.mockImplementation(
			(_params: unknown, opciones?: { enabled?: boolean }) => ({
				data: opciones?.enabled
					? {
							datos: [
								{
									id: 7,
									nombre: "Laura Gómez",
									email: "laura@hexacore.io",
									isActivo: true,
									emailVerificado: true,
									avatarUrl: null,
									roles: ["USER"],
								},
							],
							pagina: 1,
							totalElementos: 1,
							totalPaginas: 1,
						}
					: undefined,
				isFetching: false,
			}),
		);

		render(<PaletaHost abiertoInicial />);
		const combobox = screen.getByRole("combobox");

		// Con 1 carácter no habilita la consulta.
		fireEvent.change(combobox, { target: { value: "l" } });
		act(() => {
			vi.advanceTimersByTime(250);
		});
		expect(useUsuariosQueryMock).toHaveBeenLastCalledWith(
			{ pagina: 1, limite: 5, email: "l" },
			{ enabled: false },
		);

		// Con 2+ caracteres habilita la consulta y muestra el resultado.
		fireEvent.change(combobox, { target: { value: "laura@" } });
		act(() => {
			vi.advanceTimersByTime(200);
		});

		expect(useUsuariosQueryMock).toHaveBeenLastCalledWith(
			{ pagina: 1, limite: 5, email: "laura@" },
			{ enabled: true },
		);

		const opcionUsuario = screen.getByRole("option", { name: /Laura Gómez/i });
		expect(opcionUsuario).toHaveTextContent("laura@hexacore.io");

		fireEvent.click(opcionUsuario);
		expect(navigateMock).toHaveBeenCalledWith({
			to: "/usuarios",
			search: { email: "laura@hexacore.io" },
		});
	});

	it("no habilita búsqueda de usuarios si falta el permiso usuarios:leer", () => {
		vi.useFakeTimers();
		puedeMock.mockReturnValue(false);

		render(<PaletaHost abiertoInicial />);
		fireEvent.change(screen.getByRole("combobox"), {
			target: { value: "laura@hexacore.io" },
		});
		act(() => {
			vi.advanceTimersByTime(250);
		});

		expect(useUsuariosQueryMock).toHaveBeenLastCalledWith(
			{ pagina: 1, limite: 5, email: "laura@hexacore.io" },
			{ enabled: false },
		);
	});
});
