import { type RowData, useTable } from "@tanstack/react-table";
import { Inbox } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/core/utils/cn";
import { EmptyState } from "./EmptyState";
import {
	crearDefinicionesColumnas,
	ordenASortingState,
	sortingStateAOrden,
	TABLA_FEATURES,
} from "./table/adaptarColumnas";
import { Paginacion } from "./table/Paginacion";
import {
	BarraAccionesBloque,
	CheckboxSeleccion,
	IconoOrden,
	TablaCarga,
	TablaError,
} from "./table/PartesTabla";
import {
	type ItemColumnaVisible,
	SelectorColumnas,
} from "./table/SelectorColumnas";
import type { Columna, OrdenTabla, Pagina, TablaProps } from "./table/tipos";
import { useVisibilidadColumnas } from "./table/visibilidadColumnas";

export { Paginacion };
export type { Columna, OrdenTabla, Pagina, TablaProps };

const FILAS_VACIAS: RowData[] = [];

export function Tabla<T>({
	columnas,
	datos,
	clave,
	onCambioPagina,
	isLoading,
	error,
	vacio,
	etiqueta,
	tablaId,
	orden,
	onCambioOrden,
	seleccionable = false,
	puedeSeleccionar,
	accionesEnBloque,
}: TablaProps<T>) {
	const filas = useMemo(
		() =>
			(Array.isArray(datos)
				? datos
				: (datos?.datos ?? FILAS_VACIAS)) as RowData[],
		[datos],
	);
	const paginaActual = !Array.isArray(datos) ? datos?.pagina : undefined;

	const [rowSelection, setRowSelection] = useState<Record<string, true>>({});
	const sorting = useMemo(() => ordenASortingState(orden), [orden]);
	const { visibilidad, actualizarVisibilidad, restablecer, hayCambios } =
		useVisibilidadColumnas(tablaId, columnas);

	const definiciones = useMemo(
		() => crearDefinicionesColumnas(columnas),
		[columnas],
	);

	// Al cambiar de página se limpia la selección para no operar sobre filas ya no visibles.
	// biome-ignore lint/correctness/useExhaustiveDependencies: depende intencionadamente de paginaActual
	useEffect(() => {
		setRowSelection({});
	}, [paginaActual]);

	const table = useTable({
		features: TABLA_FEATURES,
		data: filas,
		columns: definiciones,
		getRowId: (fila) => String(clave(fila as T)),
		manualSorting: true,
		sortDescFirst: false,
		enableRowSelection: seleccionable
			? (row) => (puedeSeleccionar ? puedeSeleccionar(row.original as T) : true)
			: false,
		state: {
			sorting,
			columnVisibility: visibilidad,
			rowSelection,
		},
		onSortingChange: (updater) => {
			if (!onCambioOrden) return;
			const siguiente =
				typeof updater === "function" ? updater(sorting) : updater;
			onCambioOrden(sortingStateAOrden(siguiente));
		},
		onColumnVisibilityChange: actualizarVisibilidad,
		onRowSelectionChange: setRowSelection,
	});

	if (isLoading) return <TablaCarga />;
	if (error) return <TablaError error={error} />;
	if (filas.length === 0) {
		return vacio ?? <EmptyState icono={Inbox} titulo="No hay resultados" />;
	}

	const columnasOcultables = table
		.getAllLeafColumns()
		.filter((col) => col.getCanHide());
	const visiblesOcultables = columnasOcultables.filter((col) =>
		col.getIsVisible(),
	).length;

	const itemsSelector: ItemColumnaVisible[] = columnasOcultables.map((col) => {
		const visible = col.getIsVisible();
		return {
			id: col.id,
			etiqueta: col.columnDef.meta?.etiqueta ?? col.id,
			visible,
			deshabilitada: visible && visiblesOcultables <= 1,
			onToggle: col.getToggleVisibilityHandler(),
		};
	});

	const filasSeleccionadas = seleccionable
		? table.getSelectedRowModel().rows.map((row) => row.original as T)
		: [];
	const limpiarSeleccion = () => setRowSelection({});
	const mostrarSelector = Boolean(tablaId && itemsSelector.length > 0);
	const mostrarBarraBloque = Boolean(
		seleccionable && filasSeleccionadas.length > 0 && accionesEnBloque,
	);

	return (
		<div className="space-y-3">
			{(mostrarSelector || mostrarBarraBloque) && (
				<div className="flex flex-wrap items-center justify-between gap-3">
					{mostrarBarraBloque ? (
						<BarraAccionesBloque
							cantidad={filasSeleccionadas.length}
							acciones={accionesEnBloque?.(
								filasSeleccionadas,
								limpiarSeleccion,
							)}
							onLimpiar={limpiarSeleccion}
						/>
					) : (
						<div />
					)}
					{mostrarSelector && (
						<SelectorColumnas
							columnas={itemsSelector}
							hayCambios={hayCambios}
							onRestablecer={restablecer}
						/>
					)}
				</div>
			)}

			<div className="relative overflow-x-auto rounded-xl border border-borde bg-superficie shadow-sm">
				<table className="w-full text-left text-sm" aria-label={etiqueta}>
					<thead className="border-b border-borde bg-elevada/50 text-xs font-medium text-tinta-tenue">
						{table.getHeaderGroups().map((headerGroup) => (
							<tr key={headerGroup.id}>
								{seleccionable && (
									<th scope="col" className="w-11 px-4 py-3">
										<CheckboxSeleccion
											checked={table.getIsAllRowsSelected()}
											indeterminate={table.getIsSomeRowsSelected()}
											label="Seleccionar todas las filas visibles"
											onChange={table.getToggleAllRowsSelectedHandler()}
										/>
									</th>
								)}
								{headerGroup.headers.map((header) => {
									const ordenable =
										Boolean(onCambioOrden) && header.column.getCanSort();
									const estadoOrden = header.column.getIsSorted();
									const ariaSort = ordenable
										? estadoOrden === "asc"
											? "ascending"
											: estadoOrden === "desc"
												? "descending"
												: "none"
										: undefined;

									return (
										<th
											key={header.id}
											scope="col"
											aria-sort={ariaSort}
											className={cn(
												"px-6 py-3 font-medium",
												header.column.columnDef.meta?.className,
											)}
										>
											{header.isPlaceholder ? null : ordenable ? (
												<button
													type="button"
													onClick={header.column.getToggleSortingHandler()}
													className="group inline-flex cursor-pointer items-center gap-1.5 rounded hover:text-tinta focus-visible:outline-2 focus-visible:outline-acento"
												>
													<table.FlexRender header={header} />
													<IconoOrden direccion={estadoOrden} />
												</button>
											) : (
												<table.FlexRender header={header} />
											)}
										</th>
									);
								})}
							</tr>
						))}
					</thead>
					<tbody className="divide-y divide-borde">
						{table.getRowModel().rows.map((row) => (
							<tr
								key={row.id}
								data-selected={row.getIsSelected() || undefined}
								className={cn(
									"transition-colors hover:bg-elevada/40",
									row.getIsSelected() && "bg-acento-suave/50",
								)}
							>
								{seleccionable && (
									<td className="w-11 px-4 py-4">
										<CheckboxSeleccion
											checked={row.getIsSelected()}
											disabled={!row.getCanSelect()}
											label={`Seleccionar fila ${row.id}`}
											onChange={row.getToggleSelectedHandler()}
										/>
									</td>
								)}
								{row.getVisibleCells().map((cell) => (
									<td
										key={cell.id}
										className={cn(
											"px-6 py-4 text-tinta-suave",
											cell.column.columnDef.meta?.className,
										)}
									>
										<table.FlexRender cell={cell} />
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{datos && !Array.isArray(datos) && onCambioPagina && (
				<Paginacion {...datos} onCambioPagina={onCambioPagina} />
			)}
		</div>
	);
}
