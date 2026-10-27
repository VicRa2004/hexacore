import { type ReactNode, useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/core/utils/cn";
import { Button } from "./Button";

export interface DialogProps {
	abierto: boolean;
	onCerrar: () => void;
	titulo: string;
	descripcion?: ReactNode;
	children: ReactNode;
	className?: string;
}

/** Modal sobre `<dialog>` nativo: foco atrapado, Esc y fondo inerte sin librerías. */
export function Dialog({
	abierto,
	onCerrar,
	titulo,
	descripcion,
	children,
	className,
}: DialogProps) {
	const ref = useRef<HTMLDialogElement>(null);
	const id = useId();

	useEffect(() => {
		const dialogo = ref.current;
		if (!dialogo) return;
		if (abierto && !dialogo.open) dialogo.showModal();
		if (!abierto && dialogo.open) dialogo.close();
	}, [abierto]);

	return (
		// biome-ignore lint/a11y/useKeyWithClickEvents: el equivalente de teclado es Esc, nativo de <dialog>
		<dialog
			ref={ref}
			aria-labelledby={`${id}-titulo`}
			aria-describedby={descripcion ? `${id}-descripcion` : undefined}
			onClose={onCerrar}
			// Clic en el fondo (fuera de la caja) = cerrar.
			onClick={(e) => e.target === ref.current && onCerrar()}
			className={cn(
				"m-auto w-[calc(100%-2rem)] max-w-lg rounded-xl border border-borde bg-superficie p-0 text-tinta shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm",
				className,
			)}
		>
			{abierto && (
				<div className="space-y-4 p-6">
					<div className="flex items-start justify-between gap-4">
						<div className="space-y-1">
							<h2 id={`${id}-titulo`} className="text-lg font-bold">
								{titulo}
							</h2>
							{descripcion && (
								<p
									id={`${id}-descripcion`}
									className="text-sm text-tinta-tenue"
								>
									{descripcion}
								</p>
							)}
						</div>
						<Button
							variant="ghost"
							size="sm"
							onClick={onCerrar}
							aria-label="Cerrar"
						>
							<X className="h-4 w-4" />
						</Button>
					</div>
					{children}
				</div>
			)}
		</dialog>
	);
}
