import { LogOut, MailWarning } from "lucide-react";
import { useAuthStore } from "@/core/auth/store";
import { Button } from "@/core/components/ui/Button";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/core/components/ui/Card";
import {
	useCerrarSesionesMutation,
	useReenviarVerificacionMutation,
} from "../hooks/useCuentaMutation";

/** Aviso de email sin verificar y cierre de sesión en todos los dispositivos. */
export function SeguridadCuentaCard() {
	const isEmailVerificado = useAuthStore(
		(state) => state.usuario?.emailVerificado !== false,
	);
	const reenviar = useReenviarVerificacionMutation();
	const cerrarSesiones = useCerrarSesionesMutation();

	const cerrarTodas = () => {
		if (window.confirm("¿Cerrar la sesión en todos tus dispositivos?")) {
			cerrarSesiones.mutate();
		}
	};

	return (
		<Card className="max-w-2xl mx-auto space-y-4">
			<CardHeader className="pb-0">
				<CardTitle className="text-lg">Seguridad</CardTitle>
			</CardHeader>

			{!isEmailVerificado && (
				<div className="flex flex-col gap-3 rounded-lg border border-amber-800/60 bg-amber-950/30 p-4 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex items-start gap-3 text-sm text-amber-300">
						<MailWarning className="h-5 w-5 shrink-0" />
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
			)}

			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<CardDescription>
					¿Has perdido un dispositivo? Cierra la sesión en todos, incluido este.
				</CardDescription>
				<Button
					variant="danger"
					size="sm"
					onClick={cerrarTodas}
					isLoading={cerrarSesiones.isPending}
				>
					<LogOut className="h-4 w-4" />
					Cerrar todas las sesiones
				</Button>
			</div>
		</Card>
	);
}
