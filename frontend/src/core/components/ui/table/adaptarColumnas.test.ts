import { createElement } from "react";
import { describe, expect, it } from "vitest";
import {
	crearDefinicionesColumnas,
	esColumnaOcultable,
	ordenASortingState,
	resolverEtiquetaColumna,
	resolverIdColumna,
	sortingStateAOrden,
} from "./adaptarColumnas";
import type { Columna } from "./tipos";

interface Item {
	id: number;
	nombre: string;
}

describe("adaptarColumnas", () => {
	it("resuelve IDs estables priorizando id, ordenable string, cabecera e índice", () => {
		expect(
			resolverIdColumna(
				{ id: "usr", cabecera: "Usuario", celda: () => null },
				0,
			),
		).toBe("usr");
		expect(
			resolverIdColumna(
				{
					cabecera: createElement("span", null, "Correo"),
					ordenable: "email",
					celda: () => null,
				},
				1,
			),
		).toBe("email");
		expect(
			resolverIdColumna({ cabecera: "Nombre", celda: () => null }, 2),
		).toBe("Nombre");
		expect(
			resolverIdColumna(
				{ cabecera: createElement("span", null, "JSX"), celda: () => null },
				3,
			),
		).toBe("col-3");
	});

	it("detecta columnas ocultables y etiquetas", () => {
		const ocultable: Columna<Item> = {
			cabecera: "Nombre",
			celda: (x) => x.nombre,
		};
		const acciones: Columna<Item> = {
			cabecera: createElement("span", null, "Acciones"),
			celda: () => null,
			ocultable: false,
		};
		const sinEtiqueta: Columna<Item> = {
			cabecera: createElement("span", null, "Icono"),
			celda: () => null,
		};

		expect(resolverEtiquetaColumna(ocultable)).toBe("Nombre");
		expect(esColumnaOcultable(ocultable)).toBe(true);
		expect(esColumnaOcultable(acciones)).toBe(false);
		expect(esColumnaOcultable(sinEtiqueta)).toBe(false);
	});

	it("convierte bidireccionalmente entre OrdenTabla y SortingState", () => {
		expect(ordenASortingState(undefined)).toEqual([]);
		expect(ordenASortingState({ orden: "email", direccion: "desc" })).toEqual([
			{ id: "email", desc: true },
		]);
		expect(ordenASortingState({ orden: "nombre" })).toEqual([
			{ id: "nombre", desc: false },
		]);

		expect(sortingStateAOrden([])).toEqual({
			orden: undefined,
			direccion: undefined,
		});
		expect(sortingStateAOrden([{ id: "email", desc: true }])).toEqual({
			orden: "email",
			direccion: "desc",
		});
		expect(sortingStateAOrden([{ id: "id", desc: false }])).toEqual({
			orden: "id",
			direccion: "asc",
		});
	});

	it("crea definiciones de TanStack Table conservando sorting, hiding y meta", () => {
		const defs = crearDefinicionesColumnas<Item>([
			{
				id: "id",
				cabecera: "ID",
				ordenable: true,
				className: "font-mono",
				celda: (x) => x.id,
			},
			{
				id: "acciones",
				cabecera: "Acciones",
				ocultable: false,
				celda: () => null,
			},
		]);

		expect(defs[0]?.id).toBe("id");
		expect(defs[0]?.enableSorting).toBe(true);
		expect(defs[0]?.enableHiding).toBe(true);
		expect(defs[0]?.meta).toEqual({ className: "font-mono", etiqueta: "ID" });

		expect(defs[1]?.enableSorting).toBe(false);
		expect(defs[1]?.enableHiding).toBe(false);
	});
});
