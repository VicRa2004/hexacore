import { Check } from "lucide-react";
import { cn } from "@/core/utils/cn";

export type EstadoPaso = "completado" | "actual" | "pendiente";

export interface PasoItem {
	id: string;
	titulo: string;
	descripcion?: string;
}

export interface PasosProps {
	pasos: readonly PasoItem[];
	/** Índice base 0 del paso activo. */
	actual: number;
	/** Si se provee, los pasos completados permiten volver atrás al hacer clic. */
	onSeleccionar?: (indice: number) => void;
	etiqueta?: string;
	className?: string;
}

/** Acota el índice del paso activo al rango válido [0, total - 1]. */
export function normalizarPasoActual(actual: number, total: number): number {
	if (total <= 0 || !Number.isFinite(actual)) return 0;
	return Math.min(Math.max(0, Math.trunc(actual)), total - 1);
}

/** Determina el estado visual de un paso según el índice activo. */
export function estadoPaso(indice: number, actual: number): EstadoPaso {
	if (indice < actual) return "completado";
	if (indice === actual) return "actual";
	return "pendiente";
}

/** Indicador de progreso para formularios y asistentes de varios pasos. */
export function Pasos({
	pasos,
	actual,
	onSeleccionar,
	etiqueta = "Progreso de pasos",
	className,
}: PasosProps) {
	if (pasos.length === 0) return null;
	const indiceActual = normalizarPasoActual(actual, pasos.length);

	return (
		<nav aria-label={etiqueta} className={className}>
			<ol className="grid gap-3 sm:grid-cols-3">
				{pasos.map((paso, indice) => {
					const estado = estadoPaso(indice, indiceActual);
					const interactivo = estado === "completado" && Boolean(onSeleccionar);

					const contenido = (
						<div className="flex items-start gap-3">
							<span
								className={cn(
									"flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
									estado === "completado" &&
										"border-acento bg-acento text-sobre-acento",
									estado === "actual" &&
										"border-acento-borde bg-acento-suave text-acento-tinta",
									estado === "pendiente" &&
										"border-borde bg-elevada text-tinta-tenue",
								)}
							>
								{estado === "completado" ? (
									<Check className="size-3.5" aria-hidden />
								) : (
									indice + 1
								)}
							</span>
							<div className="min-w-0">
								<p
									className={cn(
										"text-sm font-medium leading-tight",
										estado === "pendiente" ? "text-tinta-tenue" : "text-tinta",
									)}
								>
									{paso.titulo}
								</p>
								{paso.descripcion && (
									<p className="mt-0.5 text-xs text-tinta-tenue">
										{paso.descripcion}
									</p>
								)}
							</div>
						</div>
					);

					return (
						<li
							key={paso.id}
							aria-current={estado === "actual" ? "step" : undefined}
							className={cn(
								"rounded-lg border p-3 transition-colors",
								estado === "actual"
									? "border-acento-borde bg-acento-suave/40"
									: "border-borde bg-superficie",
							)}
						>
							{interactivo ? (
								<button
									type="button"
									onClick={() => onSeleccionar?.(indice)}
									className="w-full cursor-pointer rounded text-left focus-visible:outline-2 focus-visible:outline-acento"
								>
									{contenido}
								</button>
							) : (
								contenido
							)}
						</li>
					);
				})}
			</ol>
		</nav>
	);
}
