import type { ReactNode } from "react";
import { Button } from "./Button";
import { Dialog } from "./Dialog";

export interface ConfirmDialogProps {
	abierto: boolean;
	titulo: string;
	mensaje: ReactNode;
	textoConfirmar?: string;
	/** Botón rojo para acciones destructivas. */
	peligroso?: boolean;
	isLoading?: boolean;
	onConfirmar: () => void;
	onCancelar: () => void;
}

/** Sustituto accesible de `window.confirm`. */
export function ConfirmDialog({
	abierto,
	titulo,
	mensaje,
	textoConfirmar = "Confirmar",
	peligroso = false,
	isLoading = false,
	onConfirmar,
	onCancelar,
}: ConfirmDialogProps) {
	return (
		<Dialog
			abierto={abierto}
			onCerrar={onCancelar}
			titulo={titulo}
			descripcion={mensaje}
			className="max-w-md"
		>
			<div className="flex justify-end gap-2 pt-2">
				<Button variant="outline" onClick={onCancelar}>
					Cancelar
				</Button>
				<Button
					variant={peligroso ? "danger" : "primary"}
					onClick={onConfirmar}
					isLoading={isLoading}
				>
					{textoConfirmar}
				</Button>
			</div>
		</Dialog>
	);
}
