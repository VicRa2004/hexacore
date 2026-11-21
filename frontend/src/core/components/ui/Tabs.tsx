import { type KeyboardEvent, type ReactNode, useId, useRef } from "react";
import { cn } from "@/core/utils/cn";

export interface Pestana<K extends string> {
	clave: K;
	etiqueta: ReactNode;
	contenido: ReactNode;
}

export interface TabsProps<K extends string> {
	pestanas: Pestana<K>[];
	activa: K;
	onCambio: (clave: K) => void;
	etiqueta: string;
	className?: string;
}

/** Pestañas accesibles (patrón WAI-ARIA: flechas, Inicio y Fin). Controladas desde fuera. */
export function Tabs<K extends string>({
	pestanas,
	activa,
	onCambio,
	etiqueta,
	className,
}: TabsProps<K>) {
	const id = useId();
	const lista = useRef<HTMLDivElement>(null);

	const moverFoco = (e: KeyboardEvent) => {
		const i = pestanas.findIndex((p) => p.clave === activa);
		const destino = {
			ArrowRight: (i + 1) % pestanas.length,
			ArrowLeft: (i - 1 + pestanas.length) % pestanas.length,
			Home: 0,
			End: pestanas.length - 1,
		}[e.key];
		const pestana = destino === undefined ? undefined : pestanas[destino];
		if (!pestana) return;
		e.preventDefault();
		onCambio(pestana.clave);
		lista.current
			?.querySelector<HTMLElement>(`#${CSS.escape(`${id}-${pestana.clave}`)}`)
			?.focus();
	};

	return (
		<div className={className}>
			<div
				ref={lista}
				role="tablist"
				aria-label={etiqueta}
				onKeyDown={moverFoco}
				className="flex gap-1 border-b border-borde"
			>
				{pestanas.map((p) => {
					const seleccionada = p.clave === activa;
					return (
						<button
							key={p.clave}
							id={`${id}-${p.clave}`}
							type="button"
							role="tab"
							aria-selected={seleccionada}
							aria-controls={`${id}-${p.clave}-panel`}
							tabIndex={seleccionada ? 0 : -1}
							onClick={() => onCambio(p.clave)}
							className={cn(
								"-mb-px inline-flex cursor-pointer items-center gap-2 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-acento [&_svg]:size-4",
								seleccionada
									? "border-acento text-tinta"
									: "border-transparent text-tinta-tenue hover:text-tinta",
							)}
						>
							{p.etiqueta}
						</button>
					);
				})}
			</div>
			{pestanas
				.filter((p) => p.clave === activa)
				.map((p) => (
					<div
						key={p.clave}
						id={`${id}-${p.clave}-panel`}
						role="tabpanel"
						aria-labelledby={`${id}-${p.clave}`}
						className="pt-6"
					>
						{p.contenido}
					</div>
				))}
		</div>
	);
}
