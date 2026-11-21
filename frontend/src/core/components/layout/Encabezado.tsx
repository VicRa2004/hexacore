import type { ReactNode } from "react";

interface EncabezadoProps {
	titulo: string;
	descripcion?: ReactNode;
	/** Botones a la derecha (p. ej. «Nuevo usuario»). */
	acciones?: ReactNode;
}

/** Cabecera común de las páginas autenticadas. */
export function Encabezado({ titulo, descripcion, acciones }: EncabezadoProps) {
	return (
		<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
			<div className="space-y-1">
				<h1 className="text-2xl font-semibold tracking-tight text-tinta">
					{titulo}
				</h1>
				{descripcion && (
					<p className="text-sm text-tinta-tenue">{descripcion}</p>
				)}
			</div>
			{acciones && <div className="flex shrink-0 gap-2">{acciones}</div>}
		</div>
	);
}
