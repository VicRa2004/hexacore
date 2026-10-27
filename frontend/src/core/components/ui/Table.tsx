import { AlertCircle, ChevronLeft, ChevronRight, Inbox } from "lucide-react";
import type { Key, ReactNode } from "react";
import { getErrorMessage } from "@/core/api/client";
import { cn } from "@/core/utils/cn";
import { Button } from "./Button";
import { EmptyState } from "./EmptyState";
import { Spinner } from "./Spinner";

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
			<div className="flex justify-center py-16" aria-busy="true">
				<Spinner size="lg" className="text-indigo-500" />
			</div>
		);
	}

	if (error) {
		return (
			<div
				role="alert"
				className="flex items-center gap-3 rounded-xl border border-rose-900/40 bg-rose-950/20 p-4 text-sm text-rose-400"
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
			<div className="overflow-x-auto rounded-xl border border-borde bg-superficie/40">
				<table className="w-full text-left text-sm" aria-label={etiqueta}>
					<thead className="border-b border-borde bg-superficie/90 text-xs uppercase tracking-wider text-tinta-tenue">
						<tr>
							{columnas.map((columna, i) => (
								<th
									// biome-ignore lint/suspicious/noArrayIndexKey: las columnas son fijas
									key={i}
									scope="col"
									className={cn("px-6 py-3.5 font-semibold", columna.className)}
								>
									{columna.cabecera}
								</th>
							))}
						</tr>
					</thead>
					<tbody className="divide-y divide-borde/60">
						{filas.map((fila) => (
							<tr
								key={clave(fila)}
								className="transition-colors hover:bg-elevada/30"
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
