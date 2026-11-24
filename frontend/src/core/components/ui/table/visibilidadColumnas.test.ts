import { createElement } from "react";
import { describe, expect, it } from "vitest";
import type { Columna } from "./tipos";
import {
	claveStorageColumnas,
	guardarVisibilidadColumnas,
	hayCambiosVisibilidad,
	leerVisibilidadColumnas,
	restablecerVisibilidadColumnas,
	type StorageSimple,
} from "./visibilidadColumnas";

interface FilaPrueba {
	id: number;
	nombre: string;
	email: string;
	notas: string;
}

const COLUMNAS: Columna<FilaPrueba>[] = [
	{ id: "id", cabecera: "ID", celda: (f) => f.id },
	{ id: "nombre", cabecera: "Nombre", celda: (f) => f.nombre },
	{
		id: "email",
		cabecera: "Email",
		celda: (f) => f.email,
		ocultaPorDefecto: true,
	},
	{
		id: "acciones",
		cabecera: createElement("span", { className: "sr-only" }, "Acciones"),
		celda: () => null,
		ocultable: false,
	},
];

function crearStorageMemoria(
	inicial: Record<string, string> = {},
): StorageSimple {
	const mapa = new Map(Object.entries(inicial));
	return {
		getItem: (k) => mapa.get(k) ?? null,
		setItem: (k, v) => {
			mapa.set(k, v);
		},
		removeItem: (k) => {
			mapa.delete(k);
		},
	};
}

describe("visibilidadColumnas", () => {
	it("aplica ocultaPorDefecto cuando no hay nada guardado", () => {
		const storage = crearStorageMemoria();
		expect(leerVisibilidadColumnas("usuarios", COLUMNAS, storage)).toEqual({
			email: false,
		});
	});

	it("ignora JSON corrupto o columnas desconocidas y conserva preferencias válidas", () => {
		const storageCorrupto = crearStorageMemoria({
			[claveStorageColumnas("usuarios")]: "{invalido",
		});
		expect(
			leerVisibilidadColumnas("usuarios", COLUMNAS, storageCorrupto),
		).toEqual({
			email: false,
		});

		const storageMixto = crearStorageMemoria({
			[claveStorageColumnas("usuarios")]: JSON.stringify({
				nombre: false,
				email: true,
				acciones: false,
				inventada: false,
			}),
		});
		expect(leerVisibilidadColumnas("usuarios", COLUMNAS, storageMixto)).toEqual(
			{
				nombre: false,
			},
		);
	});

	it("impide que todas las columnas ocultables queden ocultas", () => {
		const storage = crearStorageMemoria({
			[claveStorageColumnas("usuarios")]: JSON.stringify({
				id: false,
				nombre: false,
				email: false,
			}),
		});
		const resultado = leerVisibilidadColumnas("usuarios", COLUMNAS, storage);
		expect(resultado.id).toBeUndefined();
		expect(resultado.nombre).toBe(false);
		expect(resultado.email).toBe(false);
	});

	it("guarda y restablece preferencias en storage", () => {
		const storage = crearStorageMemoria();
		guardarVisibilidadColumnas(
			"usuarios",
			{ nombre: false, email: false },
			COLUMNAS,
			storage,
		);
		expect(leerVisibilidadColumnas("usuarios", COLUMNAS, storage)).toEqual({
			nombre: false,
			email: false,
		});
		expect(
			hayCambiosVisibilidad({ nombre: false, email: false }, COLUMNAS),
		).toBe(true);

		// Mostrar explícitamente una columna ocultaPorDefecto también se recuerda.
		guardarVisibilidadColumnas(
			"usuarios",
			{ nombre: false },
			COLUMNAS,
			storage,
		);
		expect(leerVisibilidadColumnas("usuarios", COLUMNAS, storage)).toEqual({
			nombre: false,
		});

		const restablecido = restablecerVisibilidadColumnas(
			"usuarios",
			COLUMNAS,
			storage,
		);
		expect(restablecido).toEqual({ email: false });
		expect(storage.getItem(claveStorageColumnas("usuarios"))).toBeNull();
	});
});
