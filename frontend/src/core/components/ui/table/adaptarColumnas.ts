import {
	type ColumnDef,
	columnVisibilityFeature,
	type RowData,
	rowSelectionFeature,
	rowSortingFeature,
	type SortingState,
	tableFeatures,
} from "@tanstack/react-table";
import type { Columna, MetaColumnaTabla, OrdenTabla } from "./tipos";

/** Conjunto de características activas para todas las instancias de `Tabla`. */
export const TABLA_FEATURES = tableFeatures({
	rowSortingFeature,
	columnVisibilityFeature,
	rowSelectionFeature,
	columnMeta: {} as MetaColumnaTabla,
});

export type TablaFeatures = typeof TABLA_FEATURES;

/** Resuelve un ID estable para la columna a partir de `id`, `ordenable`, `cabecera` o su índice. */
export function resolverIdColumna<T>(
	columna: Columna<T>,
	indice: number,
): string {
	if (columna.id) return columna.id;
	if (typeof columna.ordenable === "string") return columna.ordenable;
	if (typeof columna.cabecera === "string" && columna.cabecera.trim()) {
		return columna.cabecera.trim();
	}
	return `col-${indice}`;
}

/** Resuelve una etiqueta legible para el selector de columnas. */
export function resolverEtiquetaColumna<T>(
	columna: Columna<T>,
): string | undefined {
	if (columna.etiqueta) return columna.etiqueta;
	if (typeof columna.cabecera === "string" && columna.cabecera.trim()) {
		return columna.cabecera.trim();
	}
	return undefined;
}

/** Determina si una columna puede mostrarse/ocultarse en el selector. */
export function esColumnaOcultable<T>(columna: Columna<T>): boolean {
	if (columna.ocultable === false) return false;
	return resolverEtiquetaColumna(columna) !== undefined;
}

/** Convierte el orden de URL/servidor al `SortingState` de TanStack Table. */
export function ordenASortingState(orden?: OrdenTabla): SortingState {
	if (!orden?.orden) return [];
	return [{ id: orden.orden, desc: orden.direccion === "desc" }];
}

/** Convierte el `SortingState` de TanStack Table al formato `{ orden, direccion }`. */
export function sortingStateAOrden(sorting: SortingState): OrdenTabla {
	const primero = sorting[0];
	if (!primero) return { orden: undefined, direccion: undefined };
	return {
		orden: primero.id,
		direccion: primero.desc ? "desc" : "asc",
	};
}

/** Adapta la definición declarativa `Columna<T>[]` al formato `ColumnDef` de TanStack Table v9. */
export function crearDefinicionesColumnas<T>(
	columnas: Columna<T>[],
): ColumnDef<TablaFeatures, RowData, unknown>[] {
	return columnas.map((columna, indice) => {
		const id = resolverIdColumna(columna, indice);
		const etiqueta = resolverEtiquetaColumna(columna);

		return {
			id,
			header: () => columna.cabecera,
			// TanStack Table v9 exige RowData (Record<string, any>); las interfaces DTO no tienen firma de índice.
			cell: ({ row }) => columna.celda(row.original as T),
			enableSorting: Boolean(columna.ordenable),
			enableHiding: esColumnaOcultable(columna),
			meta: {
				className: columna.className,
				etiqueta,
			},
		};
	});
}
