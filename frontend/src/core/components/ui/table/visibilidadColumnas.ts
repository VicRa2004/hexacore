import type { ColumnVisibilityState } from "@tanstack/react-table";
import { useCallback, useEffect, useState } from "react";
import { esColumnaOcultable, resolverIdColumna } from "./adaptarColumnas";
import type { Columna } from "./tipos";

const PREFIJO_STORAGE = "hexacore:tabla:columnas:";

export type StorageSimple = Pick<Storage, "getItem" | "setItem" | "removeItem">;

function obtenerStoragePorDefecto(): StorageSimple | undefined {
	if (typeof window === "undefined") return undefined;
	try {
		return window.localStorage;
	} catch {
		return undefined;
	}
}

export function claveStorageColumnas(tablaId: string): string {
	return `${PREFIJO_STORAGE}${tablaId}`;
}

/** Calcula la visibilidad inicial según `ocultaPorDefecto` de cada columna ocultable. */
export function visibilidadPorDefecto<T>(
	columnas: Columna<T>[],
): ColumnVisibilityState {
	const estado: ColumnVisibilityState = {};
	for (let i = 0; i < columnas.length; i++) {
		const col = columnas[i];
		if (!col || !esColumnaOcultable(col)) continue;
		if (col.ocultaPorDefecto) {
			estado[resolverIdColumna(col, i)] = false;
		}
	}
	return estado;
}

/** Garantiza que al menos una columna ocultable permanezca visible. */
function asegurarAlMenosUnaVisible<T>(
	estado: ColumnVisibilityState,
	columnas: Columna<T>[],
): ColumnVisibilityState {
	const ocultables = columnas
		.map((col, i) =>
			esColumnaOcultable(col) ? resolverIdColumna(col, i) : null,
		)
		.filter((id): id is string => id !== null);

	if (ocultables.length === 0) return estado;
	const hayVisible = ocultables.some((id) => estado[id] !== false);
	if (hayVisible) return estado;

	const primero = ocultables[0];
	if (!primero) return estado;
	const corregido = { ...estado };
	delete corregido[primero];
	return corregido;
}

/** Lee y sanea la preferencia de columnas guardada en `localStorage`. */
export function leerVisibilidadColumnas<T>(
	tablaId: string | undefined,
	columnas: Columna<T>[],
	storage: StorageSimple | undefined = obtenerStoragePorDefecto(),
): ColumnVisibilityState {
	const base = visibilidadPorDefecto(columnas);
	if (!tablaId || !storage) return asegurarAlMenosUnaVisible(base, columnas);

	const idsOcultables = new Set(
		columnas.flatMap((col, i) =>
			esColumnaOcultable(col) ? [resolverIdColumna(col, i)] : [],
		),
	);

	try {
		const raw = storage.getItem(claveStorageColumnas(tablaId));
		if (!raw) return asegurarAlMenosUnaVisible(base, columnas);

		const parsed: unknown = JSON.parse(raw);
		if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
			return asegurarAlMenosUnaVisible(base, columnas);
		}

		const resultado: ColumnVisibilityState = { ...base };
		for (const [id, valor] of Object.entries(parsed)) {
			if (idsOcultables.has(id) && typeof valor === "boolean") {
				if (valor) {
					delete resultado[id];
				} else {
					resultado[id] = false;
				}
			}
		}
		return asegurarAlMenosUnaVisible(resultado, columnas);
	} catch {
		return asegurarAlMenosUnaVisible(base, columnas);
	}
}

/** Persiste en `localStorage` únicamente los cambios respecto al estado visible por defecto. */
export function guardarVisibilidadColumnas<T>(
	tablaId: string | undefined,
	visibilidad: ColumnVisibilityState,
	columnas: Columna<T>[],
	storage: StorageSimple | undefined = obtenerStoragePorDefecto(),
): void {
	if (!tablaId || !storage) return;

	const idsOcultables = new Set(
		columnas.flatMap((col, i) =>
			esColumnaOcultable(col) ? [resolverIdColumna(col, i)] : [],
		),
	);
	const defaults = visibilidadPorDefecto(columnas);
	const aGuardar: Record<string, boolean> = {};

	for (const id of idsOcultables) {
		const visibleActual = visibilidad[id] !== false;
		const visibleDefecto = defaults[id] !== false;
		if (visibleActual !== visibleDefecto || !visibleActual) {
			aGuardar[id] = visibleActual;
		}
	}

	try {
		const clave = claveStorageColumnas(tablaId);
		if (Object.keys(aGuardar).length === 0) {
			storage.removeItem(clave);
		} else {
			storage.setItem(clave, JSON.stringify(aGuardar));
		}
	} catch {
		// Ignorar errores de cuota o modos privados restringidos.
	}
}

export function restablecerVisibilidadColumnas<T>(
	tablaId: string | undefined,
	columnas: Columna<T>[],
	storage: StorageSimple | undefined = obtenerStoragePorDefecto(),
): ColumnVisibilityState {
	if (tablaId && storage) {
		try {
			storage.removeItem(claveStorageColumnas(tablaId));
		} catch {
			// Ignorar errores de almacenamiento.
		}
	}
	return asegurarAlMenosUnaVisible(visibilidadPorDefecto(columnas), columnas);
}

/** Indica si la visibilidad actual difiere de la configuración por defecto de las columnas. */
export function hayCambiosVisibilidad<T>(
	visibilidad: ColumnVisibilityState,
	columnas: Columna<T>[],
): boolean {
	const defaults = visibilidadPorDefecto(columnas);
	return columnas.some((col, i) => {
		if (!esColumnaOcultable(col)) return false;
		const id = resolverIdColumna(col, i);
		return (visibilidad[id] !== false) !== (defaults[id] !== false);
	});
}

/** Gestiona el estado de visibilidad de columnas sincronizado con `localStorage`. */
export function useVisibilidadColumnas<T>(
	tablaId: string | undefined,
	columnas: Columna<T>[],
) {
	const [visibilidad, setVisibilidad] = useState<ColumnVisibilityState>(() =>
		leerVisibilidadColumnas(tablaId, columnas),
	);

	useEffect(() => {
		setVisibilidad(leerVisibilidadColumnas(tablaId, columnas));
	}, [tablaId, columnas]);

	const actualizarVisibilidad = useCallback(
		(
			updater:
				| ColumnVisibilityState
				| ((prev: ColumnVisibilityState) => ColumnVisibilityState),
		) => {
			setVisibilidad((prev) => {
				const siguiente =
					typeof updater === "function" ? updater(prev) : updater;
				const seguro = asegurarAlMenosUnaVisible(siguiente, columnas);
				guardarVisibilidadColumnas(tablaId, seguro, columnas);
				return seguro;
			});
		},
		[tablaId, columnas],
	);

	const restablecer = useCallback(() => {
		setVisibilidad(restablecerVisibilidadColumnas(tablaId, columnas));
	}, [tablaId, columnas]);

	return {
		visibilidad,
		actualizarVisibilidad,
		restablecer,
		hayCambios: hayCambiosVisibilidad(visibilidad, columnas),
	};
}
