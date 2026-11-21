import { AlertCircle, ChevronLeft, ChevronRight, Inbox } from "lucide-react";
import type { Key, ReactNode } from "react";
import { getErrorMessage } from "@/core/api/client";
import { cn } from "@/core/utils/cn";
import { Button } from "./Button";
import { EmptyState } from "./EmptyState";
import { Skeleton } from "./Skeleton";

/** Forma de las respuestas paginadas del backend. */
export interface Pagina<T> {
	datos: T[];
	pagina: number;
	totalElementos: number;
	totalPaginas: number;
}

export interface Columna<T> {
	cabecera: ReactNode;
	celda: (fila: T) => ReactNode;
	className?: string;
}

export interface TablaProps<T> {
	columnas: Columna<T>[];
	/** Lista simple o página del backend (entonces muestra la paginación). */
	datos: T[] | Pagina<T> | undefined;
	clave: (fila: T) => Key;
	onCambioPagina?: (pagina: number) => void;
	isLoading?: boolean;
	error?: unknown;
	/** Contenido cuando no hay filas; por defecto un `EmptyState` genérico. */
	vacio?: ReactNode;
	etiqueta?: string;
}

export function Tabla<T>({
	columnas,
	datos,
	clave,
	onCambioPagina,
	isLoading,
	error,
	vacio,
	etiqueta,
}: TablaProps<T>) {
	if (isLoading) {
		return (
			<div
				aria-busy="true"
				className="space-y-px overflow-hidden rounded-xl border border-borde bg-superficie"
			>
				<span className="sr-only">Cargando…</span>
				<Skeleton className="h-11 rounded-none" />
				{[0, 1, 2, 3, 4].map((i) => (
					<div key={i} className="flex items-center gap-4 px-6 py-4">
						<Skeleton className="h-4 w-1/4" />
						<Skeleton className="h-4 w-1/3" />
						<Skeleton className="ml-auto h-4 w-16" />
					</div>
				))}
			</div>
		);
	}

	if (error) {
		return (
			<div
				role="alert"
				className="flex items-center gap-3 rounded-xl border border-peligro-borde bg-peligro-suave p-4 text-sm text-peligro-tinta"
			>
				<AlertCircle className="h-5 w-5 shrink-0" />
				{getErrorMessage(error)}
			</div>
		);
	}

	const filas = Array.isArray(datos) ? datos : (datos?.datos ?? []);
	if (filas.length === 0) {
		return vacio ?? <EmptyState icono={Inbox} titulo="No hay resultados" />;
	}

	return (
		<div className="space-y-4">
			<div className="relative overflow-x-auto rounded-xl border border-borde bg-superficie shadow-sm">
				<table className="w-full text-left text-sm" aria-label={etiqueta}>
					<thead className="border-b border-borde bg-elevada/50 text-xs font-medium text-tinta-tenue">
						<tr>
							{columnas.map((columna, i) => (
								<th
									// biome-ignore lint/suspicious/noArrayIndexKey: las columnas son fijas
									key={i}
									scope="col"
									className={cn("px-6 py-3 font-medium", columna.className)}
								>
									{columna.cabecera}
								</th>
							))}
						</tr>
					</thead>
					<tbody className="divide-y divide-borde">
						{filas.map((fila) => (
							<tr
								key={clave(fila)}
								className="transition-colors hover:bg-elevada/40"
							>
								{columnas.map((columna, i) => (
									<td
										// biome-ignore lint/suspicious/noArrayIndexKey: las columnas son fijas
										key={i}
										className={cn(
											"px-6 py-4 text-tinta-suave",
											columna.className,
										)}
									>
										{columna.celda(fila)}
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

export function Paginacion({
	pagina,
	totalPaginas,
	totalElementos,
	onCambioPagina,
}: Omit<Pagina<unknown>, "datos"> & {
	onCambioPagina: (pagina: number) => void;
}) {
	const total = Math.max(1, totalPaginas);
	return (
		<nav
			aria-label="Paginación"
			className="flex items-center justify-between px-1"
		>
			<p className="text-xs text-tinta-tenue">
				Página <span className="font-semibold text-tinta">{pagina}</span> de{" "}
				<span className="font-semibold text-tinta">{total}</span> ·{" "}
				{totalElementos} en total
			</p>
			<div className="flex items-center gap-2">
				<Button
					variant="outline"
					size="sm"
					disabled={pagina <= 1}
					onClick={() => onCambioPagina(pagina - 1)}
				>
					<ChevronLeft className="h-4 w-4" />
					Anterior
				</Button>
				<Button
					variant="outline"
					size="sm"
					disabled={pagina >= total}
					onClick={() => onCambioPagina(pagina + 1)}
				>
					Siguiente
					<ChevronRight className="h-4 w-4" />
				</Button>
			</div>
		</nav>
	);
}
