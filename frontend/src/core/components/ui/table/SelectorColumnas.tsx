import { Columns3, RotateCcw } from "lucide-react";
import { Menu } from "@/core/components/ui/Menu";
import { cn } from "@/core/utils/cn";

export interface ItemColumnaVisible {
	id: string;
	etiqueta: string;
	visible: boolean;
	deshabilitada: boolean;
	onToggle: (event: unknown) => void;
}

interface SelectorColumnasProps {
	columnas: ItemColumnaVisible[];
	hayCambios: boolean;
	onRestablecer: () => void;
}

/** Popover para mostrar u ocultar columnas sin perder el foco ni cerrar al marcar varias. */
export function SelectorColumnas({
	columnas,
	hayCambios,
	onRestablecer,
}: SelectorColumnasProps) {
	if (columnas.length === 0) return null;

	const ocultas = columnas.filter((c) => !c.visible).length;

	return (
		<div className="flex justify-end">
			<Menu
				etiqueta="Configurar columnas visibles"
				className="w-56 p-2"
				claseDisparador="gap-1.5 border border-borde bg-superficie px-2.5 py-1.5 text-xs font-medium text-tinta-suave shadow-sm hover:text-tinta"
				disparador={
					<>
						<Columns3 className="size-3.5 text-tinta-tenue" />
						<span>Columnas</span>
						{ocultas > 0 && (
							<span className="rounded bg-elevada px-1.5 py-0.5 text-[11px] font-semibold text-tinta">
								-{ocultas}
							</span>
						)}
					</>
				}
			>
				<div className="mb-1 flex items-center justify-between px-1.5 py-1">
					<span className="text-xs font-medium text-tinta-tenue">
						Columnas visibles
					</span>
					{hayCambios && (
						<button
							type="button"
							onClick={onRestablecer}
							className="inline-flex cursor-pointer items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium text-acento-tinta hover:bg-acento-suave"
						>
							<RotateCcw className="size-3" />
							Restablecer
						</button>
					)}
				</div>
				<div className="space-y-0.5">
					{columnas.map((col) => (
						<label
							key={col.id}
							className={cn(
								"flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-tinta-suave transition-colors hover:bg-elevada hover:text-tinta",
								col.deshabilitada &&
									"cursor-not-allowed opacity-60 hover:bg-transparent",
							)}
						>
							<input
								type="checkbox"
								checked={col.visible}
								disabled={col.deshabilitada}
								onChange={col.onToggle}
								className="size-4 cursor-pointer accent-acento focus-visible:outline-2 focus-visible:outline-acento disabled:cursor-not-allowed"
							/>
							<span className="truncate">{col.etiqueta}</span>
						</label>
					))}
				</div>
			</Menu>
		</div>
	);
}
