import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Usuario } from "@/core/auth/types";
import { renderConQueryClient } from "@/test/utils";

const {
	crearUsuarioMock,
	actualizarUsuarioMock,
	toastSuccessMock,
	toastErrorMock,
} = vi.hoisted(() => ({
	crearUsuarioMock: vi.fn(),
	actualizarUsuarioMock: vi.fn(),
	toastSuccessMock: vi.fn(),
	toastErrorMock: vi.fn(),
}));

vi.mock("../api/usuariosApi", () => ({
	usuariosApi: {
		crearUsuario: crearUsuarioMock,
		actualizarUsuario: actualizarUsuarioMock,
		eliminarUsuario: vi.fn(),
		obtenerUsuarios: vi.fn(),
		obtenerUsuarioPorId: vi.fn(),
		subirAvatar: vi.fn(),
		eliminarAvatar: vi.fn(),
	},
}));

vi.mock("sonner", () => ({
	toast: {
		success: toastSuccessMock,
		error: toastErrorMock,
	},
}));

import { UsuarioDialog } from "./UsuarioForm";

const usuarioExistente: Usuario = {
	id: 42,
	nombre: "Marta López",
	email: "marta@ejemplo.com",
	isActivo: true,
	emailVerificado: true,
	avatarUrl: null,
	roles: ["MOD"],
};

describe("UsuarioDialog (UsuarioForm)", () => {
	beforeEach(() => {
		crearUsuarioMock.mockReset();
		actualizarUsuarioMock.mockReset();
		toastSuccessMock.mockReset();
		toastErrorMock.mockReset();
	});

	it("debería validar los campos requeridos en modo alta", async () => {
		const user = userEvent.setup();
		renderConQueryClient(
			<UsuarioDialog abierto usuario={null} onCerrar={vi.fn()} />,
		);

		await user.click(screen.getByRole("button", { name: /Crear usuario/i }));

		expect(
			await screen.findByText("El nombre debe tener al menos 2 caracteres"),
		).toBeInTheDocument();
		expect(
			screen.getByText("Ingresa un correo electrónico válido"),
		).toBeInTheDocument();
		expect(
			screen.getByText("La contraseña debe tener al menos 12 caracteres"),
		).toBeInTheDocument();
		expect(crearUsuarioMock).not.toHaveBeenCalled();
	});

	it("debería crear un usuario con los datos validados y cerrar el diálogo", async () => {
		const user = userEvent.setup();
		const onCerrar = vi.fn();
		crearUsuarioMock.mockResolvedValueOnce({
			...usuarioExistente,
			id: 99,
			nombre: "Elena Ruiz",
			email: "elena@ejemplo.com",
		});

		renderConQueryClient(
			<UsuarioDialog abierto usuario={null} onCerrar={onCerrar} />,
		);

		await user.type(screen.getByLabelText("Nombre completo"), "  Elena Ruiz  ");
		await user.type(
			screen.getByLabelText("Correo electrónico"),
			"  elena@ejemplo.com  ",
		);
		await user.type(screen.getByLabelText("Contraseña"), "SecurePass123!");
		await user.click(screen.getByRole("button", { name: /Crear usuario/i }));

		await waitFor(() => {
			expect(crearUsuarioMock).toHaveBeenCalledWith({
				nombre: "Elena Ruiz",
				email: "elena@ejemplo.com",
				password: "SecurePass123!",
			});
		});
		expect(onCerrar).toHaveBeenCalledTimes(1);
	});

	it("debería permitir editar sin contraseña cuando el usuario ya existe", async () => {
		const user = userEvent.setup();
		const onCerrar = vi.fn();
		actualizarUsuarioMock.mockResolvedValueOnce({
			...usuarioExistente,
			nombre: "Marta Editada",
		});

		renderConQueryClient(
			<UsuarioDialog abierto usuario={usuarioExistente} onCerrar={onCerrar} />,
		);

		const campoNombre = screen.getByLabelText("Nombre completo");
		expect(campoNombre).toHaveValue("Marta López");
		expect(screen.getByLabelText("Correo electrónico")).toHaveValue(
			"marta@ejemplo.com",
		);

		await user.clear(campoNombre);
		await user.type(campoNombre, "Marta Editada");
		await user.click(screen.getByRole("button", { name: /Guardar cambios/i }));

		await waitFor(() => {
			expect(actualizarUsuarioMock).toHaveBeenCalledWith(42, {
				nombre: "Marta Editada",
				email: "marta@ejemplo.com",
			});
		});
		expect(onCerrar).toHaveBeenCalledTimes(1);
	});
});
