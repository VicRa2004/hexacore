import { AlertCircle, ArrowDown, ArrowUp, ArrowUpDown, X } from "lucide-react";
import { type ReactNode, useEffect, useRef } from "react";
import { getErrorMessage } from "@/core/api/client";
import { Skeleton } from "../Skeleton";

export function CheckboxSeleccion({
	checked,
	indeterminate = false,
	disabled = false,
	label,
	onChange,
}: {
	checked: boolean;
	indeterminate?: boolean;
	disabled?: boolean;
	label: string;
	onChange: (event: unknown) => void;
}) {
	const ref = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (ref.current) {
			ref.current.indeterminate = indeterminate && !checked;
		}
	}, [indeterminate, checked]);

	return (
		<input
			ref={ref}
			type="checkbox"
			aria-label={label}
			checked={checked}
			disabled={disabled}
			onChange={onChange}
			className="size-4 cursor-pointer accent-acento focus-visible:outline-2 focus-visible:outline-acento disabled:cursor-not-allowed disabled:opacity-40"
		/>
	);
}

export function IconoOrden({
	direccion,
}: {
	direccion: false | "asc" | "desc";
}) {
	if (direccion === "asc") {
		return <ArrowUp className="size-3.5 text-acento-tinta" />;
	}
	if (direccion === "desc") {
		return <ArrowDown className="size-3.5 text-acento-tinta" />;
	}
	return <ArrowUpDown className="size-3.5 opacity-45 group-hover:opacity-90" />;
}

export function TablaCarga() {
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

export function TablaError({ error }: { error: unknown }) {
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

export function BarraAccionesBloque({
	cantidad,
	acciones,
	onLimpiar,
}: {
	cantidad: number;
	acciones: ReactNode;
	onLimpiar: () => void;
}) {
	return (
		<section
			aria-label="Acciones en bloque"
			className="flex flex-wrap items-center gap-2 rounded-lg border border-acento-borde bg-acento-suave px-3 py-1.5 text-sm text-tinta"
		>
			<span className="font-medium">
				{cantidad} {cantidad === 1 ? "seleccionado" : "seleccionados"}
			</span>
			<div className="flex flex-wrap items-center gap-2">{acciones}</div>
			<button
				type="button"
				onClick={onLimpiar}
				className="inline-flex cursor-pointer items-center gap-1 rounded px-1.5 py-0.5 text-xs text-tinta-suave hover:bg-superficie hover:text-tinta"
			>
				<X className="size-3.5" />
				Limpiar
			</button>
		</section>
	);
}
