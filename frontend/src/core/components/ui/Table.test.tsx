import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { type Columna, Tabla } from "./Table";

interface FilaDemo {
	id: number;
	nombre: string;
	rol: string;
}

const COLUMNAS: Columna<FilaDemo>[] = [
	{ id: "nombre", cabecera: "Nombre", celda: (f) => f.nombre },
	{ id: "rol", cabecera: "Rol", celda: (f) => f.rol },
];

describe("Tabla", () => {
	it("debería mostrar el estado de carga cuando isLoading es true", () => {
		const { container } = render(
			<Tabla
				columnas={COLUMNAS}
				datos={undefined}
				clave={(f) => f.id}
				isLoading
			/>,
		);

		expect(screen.getByText("Cargando…")).toBeInTheDocument();
		expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument();
		expect(screen.queryByRole("table")).not.toBeInTheDocument();
	});

	it("debería mostrar la alerta de error cuando recibe un error", () => {
		render(
			<Tabla
				columnas={COLUMNAS}
				datos={[]}
				clave={(f) => f.id}
				error={new Error("No se pudieron cargar los registros")}
			/>,
		);

		const alerta = screen.getByRole("alert");
		expect(alerta).toHaveTextContent("No se pudieron cargar los registros");
		expect(screen.queryByRole("table")).not.toBeInTheDocument();
	});

	it("debería mostrar el estado vacío por defecto o personalizado cuando no hay filas", () => {
		const { rerender } = render(
			<Tabla columnas={COLUMNAS} datos={[]} clave={(f) => f.id} />,
		);

		expect(screen.getByText("No hay resultados")).toBeInTheDocument();

		rerender(
			<Tabla
				columnas={COLUMNAS}
				datos={{ datos: [], pagina: 1, totalElementos: 0, totalPaginas: 0 }}
				clave={(f) => f.id}
				vacio={<p>Lista sin elementos</p>}
			/>,
		);

		expect(screen.getByText("Lista sin elementos")).toBeInTheDocument();
	});

	it("debería renderizar las cabeceras y filas cuando hay datos", () => {
		render(
			<Tabla
				etiqueta="Tabla de prueba"
				columnas={COLUMNAS}
				datos={[
					{ id: 1, nombre: "Ana", rol: "ADMIN" },
					{ id: 2, nombre: "Luis", rol: "MOD" },
				]}
				clave={(f) => f.id}
			/>,
		);

		expect(
			screen.getByRole("table", { name: "Tabla de prueba" }),
		).toBeInTheDocument();
		expect(screen.getByText("Ana")).toBeInTheDocument();
		expect(screen.getByText("ADMIN")).toBeInTheDocument();
		expect(screen.getByText("Luis")).toBeInTheDocument();
		expect(screen.getByText("MOD")).toBeInTheDocument();
	});
});
