import { Link } from "@tanstack/react-router";
import { ArrowRight, History } from "lucide-react";
import { getErrorMessage } from "@/core/api/client";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/core/components/ui/Card";
import { EmptyState } from "@/core/components/ui/EmptyState";
import { Skeleton } from "@/core/components/ui/Skeleton";
import { fechaCompleta, fechaRelativa } from "@/core/utils/fecha";
import { useAuditoriaQuery } from "../hooks/useAuditoriaQuery";
import { EventoBadge } from "./EventoBadge";

/** Últimos eventos de auditoría para el dashboard. */
export function ActividadReciente() {
	const { data, isLoading, error } = useAuditoriaQuery({
		pagina: 1,
		limite: 6,
	});

	return (
		<Card className="flex flex-col">
			<CardHeader className="flex-row items-start justify-between space-y-0">
				<div className="space-y-1.5">
					<CardTitle>Actividad reciente</CardTitle>
					<CardDescription>
						Últimos cambios registrados en el sistema.
					</CardDescription>
				</div>
				<Link
					to="/auditoria"
					className="inline-flex items-center gap-1 text-sm font-medium text-acento-tinta hover:underline"
				>
					Ver todo
					<ArrowRight className="size-3.5" />
				</Link>
			</CardHeader>

			{error ? (
				<p className="text-sm text-tinta-tenue">{getErrorMessage(error)}</p>
			) : isLoading ? (
				<div className="space-y-4">
					{[0, 1, 2, 3].map((i) => (
						<Skeleton key={i} className="h-5 w-full" />
					))}
				</div>
			) : !data?.datos.length ? (
				<EmptyState icono={History} titulo="Aún no hay actividad" />
			) : (
				<ol className="relative space-y-4 border-l border-borde pl-5">
					{data.datos.map((r) => (
						<li key={r.id} className="relative">
							<span className="absolute top-1.5 -left-[1.4rem] size-2 rounded-full bg-acento ring-4 ring-superficie" />
							<div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
								<EventoBadge evento={r.evento} />
								<span className="text-tinta-tenue">
									{r.usuarioId === null
										? "por el sistema"
										: `por el usuario #${r.usuarioId}`}
								</span>
								<time
									dateTime={r.ocurridoEn}
									title={fechaCompleta(r.ocurridoEn)}
									className="ml-auto text-xs text-tinta-tenue"
								>
									{fechaRelativa(r.ocurridoEn)}
								</time>
							</div>
						</li>
					))}
				</ol>
			)}
		</Card>
	);
}
