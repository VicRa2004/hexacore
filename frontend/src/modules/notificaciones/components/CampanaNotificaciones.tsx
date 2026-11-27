import { Bell, CheckCheck } from "lucide-react";
import { Button } from "@/core/components/ui/Button";
import { Menu } from "@/core/components/ui/Menu";
import { Skeleton } from "@/core/components/ui/Skeleton";
import { cn } from "@/core/utils/cn";
import {
	useMarcarLeidaMutation,
	useMarcarTodasLeidasMutation,
	useNotificacionesQuery,
} from "../hooks/useNotificacionesQuery";
import {
	formatearNotificacion,
	formatearTiempoRelativo,
} from "../utils/formatearNotificacion";

/** Campana de notificaciones en la barra superior con contador y lista desplegable. */
export function CampanaNotificaciones() {
	const { data, isLoading, isError } = useNotificacionesQuery();
	const marcarLeida = useMarcarLeidaMutation();
	const marcarTodas = useMarcarTodasLeidasMutation();

	// Si el backend desactiva el módulo (404 -> null), no se muestra la campana.
	if (data === null) return null;

	const noLeidas = data?.noLeidas ?? 0;
	const items = data?.datos ?? [];
	const etiquetaContador = noLeidas > 99 ? "99+" : String(noLeidas);

	return (
		<Menu
			etiqueta={
				noLeidas > 0
					? `Notificaciones (${noLeidas} sin leer)`
					: "Notificaciones"
			}
			claseDisparador="relative size-9 justify-center text-tinta-suave hover:text-tinta"
			className="w-80 overflow-hidden p-0 sm:w-96"
			disparador={
				<>
					<Bell className="size-4.5" />
					{noLeidas > 0 && (
						<span
							aria-hidden="true"
							className="absolute -top-0.5 -right-0.5 inline-flex min-w-4.5 items-center justify-center rounded-full bg-acento px-1 text-[10px] leading-4 font-semibold text-sobre-acento"
						>
							{etiquetaContador}
						</span>
					)}
				</>
			}
		>
			<div className="flex items-center justify-between border-b border-borde px-3.5 py-2.5">
				<div className="flex items-center gap-2">
					<h2 className="text-sm font-semibold text-tinta">Notificaciones</h2>
					{noLeidas > 0 && (
						<span className="rounded-full bg-acento-suave px-2 py-0.5 text-xs font-medium text-acento-tinta">
							{noLeidas}
						</span>
					)}
				</div>
				{noLeidas > 0 && (
					<Button
						type="button"
						variant="ghost"
						size="sm"
						disabled={marcarTodas.isPending}
						onClick={() => marcarTodas.mutate()}
						className="h-7 gap-1 px-2 text-xs text-acento-tinta hover:bg-acento-suave"
					>
						<CheckCheck className="size-3.5" />
						Marcar todas
					</Button>
				)}
			</div>

			<div className="max-h-96 divide-y divide-borde overflow-y-auto">
				{isLoading ? (
					<div className="space-y-3 p-3.5">
						<Skeleton className="h-12 w-full" />
						<Skeleton className="h-12 w-full" />
					</div>
				) : isError ? (
					<p className="px-4 py-6 text-center text-xs text-tinta-tenue">
						No se pudieron cargar las notificaciones.
					</p>
				) : items.length === 0 ? (
					<p className="px-4 py-8 text-center text-sm text-tinta-tenue">
						No tienes notificaciones
					</p>
				) : (
					items.map((item) => {
						const { titulo, descripcion } = formatearNotificacion(item);
						const tiempo = formatearTiempoRelativo(item.createdAt);

						return (
							<button
								key={item.id}
								type="button"
								disabled={item.leida || marcarLeida.isPending}
								onClick={() => {
									if (!item.leida) marcarLeida.mutate(item.id);
								}}
								className={cn(
									"flex w-full items-start gap-2.5 px-3.5 py-3 text-left transition-colors",
									item.leida
										? "bg-superficie opacity-75"
										: "cursor-pointer bg-acento-suave/50 hover:bg-acento-suave",
								)}
							>
								<span
									aria-hidden="true"
									className={cn(
										"mt-1.5 size-2 shrink-0 rounded-full",
										item.leida ? "bg-transparent" : "bg-acento",
									)}
								/>
								<div className="min-w-0 flex-1 space-y-0.5">
									<div className="flex items-baseline justify-between gap-2">
										<p className="truncate text-sm font-medium text-tinta">
											{titulo}
										</p>
										{tiempo && (
											<span className="shrink-0 text-[11px] text-tinta-tenue">
												{tiempo}
											</span>
										)}
									</div>
									<p className="line-clamp-2 text-xs text-tinta-suave">
										{descripcion}
									</p>
								</div>
							</button>
						);
					})
				)}
			</div>
		</Menu>
	);
}
