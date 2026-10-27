import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/core/utils/cn";

export interface EmptyStateProps {
	icono: LucideIcon;
	titulo: string;
	descripcion?: ReactNode;
	/** Botón o enlace para salir del vacío (p. ej. «Crear el primero»). */
	accion?: ReactNode;
	className?: string;
}

export function EmptyState({
	icono: Icono,
	titulo,
	descripcion,
	accion,
	className,
}: EmptyStateProps) {
	return (
		<div
			className={cn(
				"rounded-xl border border-dashed border-borde bg-superficie/40 p-12 text-center",
				className,
			)}
		>
			<Icono className="mx-auto h-10 w-10 text-tinta-tenue" aria-hidden />
			<h4 className="mt-3 text-sm font-semibold text-tinta">{titulo}</h4>
			{descripcion && (
				<p className="mt-1 text-xs text-tinta-tenue">{descripcion}</p>
			)}
			{accion && <div className="mt-4 flex justify-center">{accion}</div>}
		</div>
	);
}
