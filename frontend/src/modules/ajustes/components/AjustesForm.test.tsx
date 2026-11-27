import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AjustesDto } from "@/core/api/schema.gen";
import { renderConQueryClient } from "@/test/utils";

const { actualizarMock, toastSuccessMock, toastErrorMock } = vi.hoisted(() => ({
	actualizarMock: vi.fn(),
	toastSuccessMock: vi.fn(),
	toastErrorMock: vi.fn(),
}));

vi.mock("../api/ajustesApi", () => ({
	ajustesApi: {
		obtenerPublicos: vi.fn(),
		obtener: vi.fn(),
		actualizar: actualizarMock,
		subirImagen: vi.fn(),
		eliminarImagen: vi.fn(),
	},
}));

vi.mock("sonner", () => ({
	toast: {
		success: toastSuccessMock,
		error: toastErrorMock,
	},
}));

import { AjustesForm } from "./AjustesForm";

const ajustesIniciales: AjustesDto = {
	nombreApp: "Hexacore",
	colorMarca: 277,
	remitenteCorreo: "Hexacore <no-reply@ejemplo.com>",
	registroPublicoAbierto: true,
	logoUrl: null,
	faviconUrl: null,
};

describe("AjustesForm", () => {
	beforeEach(() => {
		actualizarMock.mockReset();
		toastSuccessMock.mockReset();
		toastErrorMock.mockReset();
	});

	it("muestra la barra de guardado al editar y envía los datos validados", async () => {
		const user = userEvent.setup();
		const respuesta: AjustesDto = {
			...ajustesIniciales,
			nombreApp: "Mi Portal",
			registroPublicoAbierto: false,
		};
		actualizarMock.mockResolvedValueOnce(respuesta);

		renderConQueryClient(
			<AjustesForm ajustes={ajustesIniciales} puedeEditar />,
		);

		expect(
			screen.queryByText("Hay cambios sin guardar"),
		).not.toBeInTheDocument();

		const campoNombre = screen.getByLabelText("Nombre de la aplicación");
		await user.clear(campoNombre);
		await user.type(campoNombre, "Mi Portal");
		await user.click(
			screen.getByLabelText("Permitir registro público de nuevos usuarios"),
		);

		expect(screen.getByText("Hay cambios sin guardar")).toBeInTheDocument();
		await user.click(screen.getByRole("button", { name: /Guardar/i }));

		await waitFor(() => {
			expect(actualizarMock).toHaveBeenCalledWith({
				nombreApp: "Mi Portal",
				colorMarca: 277,
				remitenteCorreo: "Hexacore <no-reply@ejemplo.com>",
				registroPublicoAbierto: false,
			});
		});
		expect(toastSuccessMock).toHaveBeenCalledWith("Ajustes guardados");
	});

	it("valida el remitente de correo con Zod antes de enviar", async () => {
		const user = userEvent.setup();
		renderConQueryClient(
			<AjustesForm ajustes={ajustesIniciales} puedeEditar />,
		);

		const campoRemitente = screen.getByLabelText("Remitente de correos");
		await user.clear(campoRemitente);
		await user.type(campoRemitente, "no-valido");
		await user.click(screen.getByRole("button", { name: /Guardar/i }));

		expect(
			await screen.findByText(
				"Usa un email válido o formato «Nombre <correo@dominio.com>»",
			),
		).toBeInTheDocument();
		expect(actualizarMock).not.toHaveBeenCalled();
	});

	it("deshabilita los campos en modo solo lectura", () => {
		renderConQueryClient(
			<AjustesForm ajustes={ajustesIniciales} puedeEditar={false} />,
		);

		expect(screen.getByLabelText("Nombre de la aplicación")).toBeDisabled();
		expect(
			screen.queryByRole("button", { name: /Guardar/i }),
		).not.toBeInTheDocument();
	});
});
