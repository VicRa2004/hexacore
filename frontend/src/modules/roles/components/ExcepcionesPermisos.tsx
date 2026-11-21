import { Check, Minus, X } from "lucide-react";
import { Badge } from "@/core/components/ui/Badge";
import { cn } from "@/core/utils/cn";
import type { PermisoDto } from "../api/rolesApi";
import { agruparPorRecurso } from "../utils/agruparPorRecurso";

export type Decision = "heredado" | "conceder" | "denegar";

const OPCIONES: { valor: Decision; etiqueta: string; activa: string }[] = [
	{
		valor: "heredado",
		etiqueta: "Según roles",
		activa: "bg-superficie text-tinta shadow-sm",
	},
	{
		valor: "conceder",
		etiqueta: "Conceder",
		activa: "bg-exito-suave text-exito-tinta shadow-sm",
	},
	{
		valor: "denegar",
		etiqueta: "Denegar",
		activa: "bg-peligro-suave text-peligro-tinta shadow-sm",
	},
];

interface ExcepcionesPermisosProps {
	permisos: PermisoDto[];
	/** Permisos que ya conceden los roles marcados. */
	porRoles: Set<number>;
	decisiones: Map<number, Decision>;
	onDecidir: (permisoId: number, decision: Decision) => void;
}

/** Por permiso: lo que dan los roles, la excepción elegida y el resultado final. */
export function ExcepcionesPermisos({
	permisos,
	porRoles,
	decisiones,
	onDecidir,
}: ExcepcionesPermisosProps) {
	const excepciones = [...decisiones.values()].filter(
		(d) => d !== "heredado",
	).length;

	return (
		<div className="space-y-3">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<p className="text-xs text-tinta-tenue">
					«Conceder» y «Denegar» ganan a lo que digan sus roles.
				</p>
				<Badge variant={excepciones ? "warning" : "default"}>
					{excepciones} {excepciones === 1 ? "excepción" : "excepciones"}
				</Badge>
			</div>

			<div className="divide-y divide-borde overflow-hidden rounded-lg border border-borde">
				{agruparPorRecurso(permisos).map(([recurso, delRecurso]) => (
					<section key={recurso} aria-label={recurso}>
						<h4 className="bg-elevada/60 px-3 py-1.5 text-xs font-semibold capitalize text-tinta-suave">
							{recurso}
						</h4>
						<ul className="divide-y divide-borde">
							{delRecurso.map((permiso) => {
								const decision = decisiones.get(permiso.id) ?? "heredado";
								const heredado = porRoles.has(permiso.id);
								const final =
									decision === "heredado" ? heredado : decision === "conceder";
								return (
									<li
										key={permiso.id}
										// Móvil: nombre y resultado arriba, selector debajo a todo el ancho.
										className={cn(
											"grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 px-3 py-2.5 sm:grid-cols-[minmax(0,1fr)_auto_7rem]",
											decision !== "heredado" && "bg-aviso-suave/40",
										)}
									>
										<div className="min-w-0">
											<p className="text-sm font-medium capitalize">
												{permiso.accion}
											</p>
											<p className="flex items-center gap-1 text-xs text-tinta-tenue">
												{heredado ? (
													<Check className="size-3" aria-hidden />
												) : (
													<Minus className="size-3" aria-hidden />
												)}
												{heredado ? "Lo dan sus roles" : "Sus roles no lo dan"}
											</p>
										</div>
										<fieldset className="order-last col-span-2 grid grid-cols-3 rounded-md bg-elevada p-0.5 sm:order-none sm:col-span-1 sm:inline-grid">
											<legend className="sr-only">
												{`Excepción para ${permiso.recurso}:${permiso.accion}`}
											</legend>
											{OPCIONES.map((o) => (
												<label
													key={o.valor}
													className={cn(
														"cursor-pointer rounded-sm px-2 py-1.5 text-center text-xs whitespace-nowrap transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-acento sm:py-1",
														decision === o.valor
															? o.activa
															: "text-tinta-tenue hover:text-tinta",
													)}
												>
													<input
														type="radio"
														className="sr-only"
														name={`decision-${permiso.id}`}
														checked={decision === o.valor}
														onChange={() => onDecidir(permiso.id, o.valor)}
													/>
													{o.etiqueta}
												</label>
											))}
										</fieldset>
										<div className="justify-self-end">
											{final ? (
												<Badge variant="success">
													<Check className="size-3" />
													Permitido
												</Badge>
											) : (
												<Badge variant="danger">
													<X className="size-3" />
													Sin acceso
												</Badge>
											)}
										</div>
									</li>
								);
							})}
						</ul>
					</section>
				))}
			</div>
		</div>
	);
}
