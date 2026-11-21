import { MailWarning } from "lucide-react";
import { useAuthStore } from "@/core/auth/store";
import { Button } from "@/core/components/ui/Button";
import { useReenviarVerificacionMutation } from "../hooks/useCuentaMutation";

/** Aviso con reenvío del enlace mientras el email no esté verificado. */
export function AvisoVerificacionEmail() {
	const isEmailVerificado = useAuthStore(
		(state) => state.usuario?.emailVerificado !== false,
	);
	const reenviar = useReenviarVerificacionMutation();

	if (isEmailVerificado) return null;
	return (
		<div
			role="status"
			className="flex flex-col gap-3 rounded-lg border border-aviso-borde bg-aviso-suave p-4 sm:flex-row sm:items-center sm:justify-between"
		>
			<div className="flex items-start gap-3 text-sm text-aviso-tinta">
				<MailWarning className="size-5 shrink-0" />
				Tu email no está verificado. Revisa tu bandeja de entrada.
			</div>
			<Button
				variant="outline"
				size="sm"
				onClick={() => reenviar.mutate()}
				isLoading={reenviar.isPending}
			>
				Reenviar enlace
			</Button>
		</div>
	);
}
