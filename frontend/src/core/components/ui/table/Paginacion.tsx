import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../Button";
import type { Pagina } from "./tipos";

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
