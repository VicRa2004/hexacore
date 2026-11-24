import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { type Pestana, Tabs } from "./Tabs";

const PESTANAS: Pestana<"cuenta" | "seguridad" | "actividad">[] = [
	{
		clave: "cuenta",
		etiqueta: "Cuenta",
		contenido: <p>Contenido de cuenta</p>,
	},
	{
		clave: "seguridad",
		etiqueta: "Seguridad",
		contenido: <p>Contenido de seguridad</p>,
	},
	{
		clave: "actividad",
		etiqueta: "Actividad",
		contenido: <p>Contenido de actividad</p>,
	},
];

function TabsControlado() {
	const [activa, setActiva] = useState<"cuenta" | "seguridad" | "actividad">(
		"cuenta",
	);
	return (
		<Tabs
			pestanas={PESTANAS}
			activa={activa}
			onCambio={setActiva}
			etiqueta="Secciones del perfil"
		/>
	);
}

describe("Tabs", () => {
	it("debería renderizar las pestañas y mostrar solo el panel activo", () => {
		render(
			<Tabs
				pestanas={PESTANAS}
				activa="seguridad"
				onCambio={vi.fn()}
				etiqueta="Secciones del perfil"
			/>,
		);

		expect(
			screen.getByRole("tablist", { name: "Secciones del perfil" }),
		).toBeInTheDocument();
		expect(screen.getByRole("tab", { name: "Cuenta" })).toHaveAttribute(
			"aria-selected",
			"false",
		);
		expect(screen.getByRole("tab", { name: "Seguridad" })).toHaveAttribute(
			"aria-selected",
			"true",
		);
		expect(screen.getByText("Contenido de seguridad")).toBeInTheDocument();
		expect(screen.queryByText("Contenido de cuenta")).not.toBeInTheDocument();
	});

	it("debería navegar con flechas, Inicio y Fin moviendo selección y foco", async () => {
		const user = userEvent.setup();
		render(<TabsControlado />);

		const tabCuenta = screen.getByRole("tab", { name: "Cuenta" });
		const tabSeguridad = screen.getByRole("tab", { name: "Seguridad" });
		const tabActividad = screen.getByRole("tab", { name: "Actividad" });

		tabCuenta.focus();

		await user.keyboard("{ArrowRight}");
		expect(tabSeguridad).toHaveAttribute("aria-selected", "true");
		expect(tabSeguridad).toHaveFocus();
		expect(screen.getByText("Contenido de seguridad")).toBeInTheDocument();

		await user.keyboard("{End}");
		expect(tabActividad).toHaveAttribute("aria-selected", "true");
		expect(tabActividad).toHaveFocus();

		// ArrowRight desde la última pestaña vuelve a la primera (ciclo)
		await user.keyboard("{ArrowRight}");
		expect(tabCuenta).toHaveAttribute("aria-selected", "true");
		expect(tabCuenta).toHaveFocus();

		// ArrowLeft desde la primera pestaña salta a la última (ciclo)
		await user.keyboard("{ArrowLeft}");
		expect(tabActividad).toHaveAttribute("aria-selected", "true");
		expect(tabActividad).toHaveFocus();

		await user.keyboard("{Home}");
		expect(tabCuenta).toHaveAttribute("aria-selected", "true");
		expect(tabCuenta).toHaveFocus();
	});
});
