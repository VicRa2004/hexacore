import { LogOut, Monitor, Smartphone } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/core/components/ui/Badge";
import { Button } from "@/core/components/ui/Button";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/core/components/ui/Card";
import { ConfirmDialog } from "@/core/components/ui/ConfirmDialog";
import { Skeleton } from "@/core/components/ui/Skeleton";
import { fechaCompleta, fechaRelativa } from "@/core/utils/fecha";
import {
	useCerrarSesionesMutation,
	useCerrarSesionMutation,
	useSesionesQuery,
} from "../hooks/useCuentaMutation";
import { describirDispositivo } from "../utils/dispositivo";

/** Sesiones abiertas por dispositivo: cerrar una o todas. */
export function SesionesCard() {
	const { data: sesiones, isLoading } = useSesionesQuery();
	const cerrarUna = useCerrarSesionMutation();
	const cerrarTodas = useCerrarSesionesMutation();
	const [confirmando, setConfirmando] = useState(false);

	return (
		<Card>
			<CardHeader className="sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
				<div className="space-y-1.5">
					<CardTitle>Sesiones abiertas</CardTitle>
					<CardDescription>
						Dispositivos con tu cuenta iniciada. Cierra los que no reconozcas.
					</CardDescription>
				</div>
				<Button
					variant="outline"
					size="sm"
					onClick={() => setConfirmando(true)}
					className="mt-3 text-peligro-tinta sm:mt-0"
				>
					<LogOut />
					Cerrar todas
				</Button>
			</CardHeader>

			<ul className="divide-y divide-borde rounded-lg border border-borde">
				{isLoading &&
					[0, 1].map((i) => (
						<li key={i} className="flex items-center gap-3 p-4">
							<Skeleton className="size-9 rounded-lg" />
							<div className="space-y-2">
								<Skeleton className="h-4 w-40" />
								<Skeleton className="h-3 w-24" />
							</div>
						</li>
					))}
				{sesiones?.map((sesion) => {
					const { nombre, movil } = describirDispositivo(sesion.userAgent);
					const Icono = movil ? Smartphone : Monitor;
					return (
						<li key={sesion.id} className="flex items-center gap-3 p-4">
							<span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-elevada text-tinta-suave">
								<Icono className="size-4.5" />
							</span>
							<div className="min-w-0 flex-1">
								<p className="flex flex-wrap items-center gap-2 text-sm font-medium">
									{nombre}
									{sesion.actual && (
										<Badge variant="success">Esta sesión</Badge>
									)}
								</p>
								<p className="text-xs text-tinta-tenue">
									Última actividad{" "}
									<time
										dateTime={sesion.ultimoUso}
										title={fechaCompleta(sesion.ultimoUso)}
									>
										{fechaRelativa(sesion.ultimoUso)}
									</time>
								</p>
							</div>
							{!sesion.actual && (
								<Button
									variant="ghost"
									size="sm"
									onClick={() => cerrarUna.mutate(sesion.id)}
									isLoading={
										cerrarUna.isPending && cerrarUna.variables === sesion.id
									}
									aria-label={`Cerrar la sesión de ${nombre}`}
								>
									Cerrar
								</Button>
							)}
						</li>
					);
				})}
			</ul>

			<ConfirmDialog
				abierto={confirmando}
				titulo="¿Cerrar todas las sesiones?"
				mensaje="Tendrás que volver a iniciar sesión en todos tus dispositivos, incluido este."
				textoConfirmar="Cerrar sesiones"
				peligroso
				isLoading={cerrarTodas.isPending}
				onConfirmar={() => cerrarTodas.mutate()}
				onCancelar={() => setConfirmando(false)}
			/>
		</Card>
	);
}
