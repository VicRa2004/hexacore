import type { ReactNode } from "react";
import { cn } from "@/core/utils/cn";

export interface TooltipProps {
	texto: string;
	children: ReactNode;
	/** Lado por el que aparece. */
	lado?: "derecha" | "abajo";
	/** `false` lo desactiva sin cambiar el árbol (p. ej. sidebar desplegado). */
	activo?: boolean;
}

/**
 * Etiqueta flotante al pasar el ratón o enfocar con teclado. Solo CSS: el texto
 * visible no sustituye al nombre accesible, que debe tenerlo el propio hijo.
 */
export function Tooltip({
	texto,
	children,
	lado = "derecha",
	activo = true,
}: TooltipProps) {
	return (
		<span className="group/tooltip relative flex">
			{children}
			{activo && (
				<span
					aria-hidden
					className={cn(
						"pointer-events-none absolute z-50 whitespace-nowrap rounded-md bg-tinta px-2 py-1 text-xs font-medium text-fondo opacity-0 shadow-flotante transition-opacity group-hover/tooltip:opacity-100 group-has-focus-visible/tooltip:opacity-100",
						lado === "derecha"
							? "left-full top-1/2 ml-2 -translate-y-1/2"
							: "top-full left-1/2 mt-2 -translate-x-1/2",
					)}
				>
					{texto}
				</span>
			)}
		</span>
	);
}
