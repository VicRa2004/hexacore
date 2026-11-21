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

			<div className="overflow-hidden rounded-lg border border-borde">
				<table className="w-full text-sm">
					<caption className="sr-only">Excepciones de permisos</caption>
					<thead className="bg-elevada/60 text-xs text-tinta-suave">
						<tr>
							<th scope="col" className="px-3 py-2 text-left font-medium">
								Permiso
							</th>
							<th
								scope="col"
								className="hidden px-3 py-2 text-center font-medium sm:table-cell"
							>
								Por roles
							</th>
							<th scope="col" className="px-3 py-2 text-left font-medium">
								Excepción
							</th>
							<th scope="col" className="px-3 py-2 text-center font-medium">
								Resultado
							</th>
						</tr>
					</thead>
					{agruparPorRecurso(permisos).map(([recurso, delRecurso]) => (
						<tbody
							key={recurso}
							className="divide-y divide-borde border-t border-borde"
						>
							<tr className="bg-fondo/60">
								<th
									scope="rowgroup"
									colSpan={4}
									className="px-3 py-1.5 text-left text-xs font-semibold capitalize text-tinta-tenue"
								>
									{recurso}
								</th>
							</tr>
							{delRecurso.map((permiso) => {
								const decision = decisiones.get(permiso.id) ?? "heredado";
								const heredado = porRoles.has(permiso.id);
								const final =
									decision === "heredado" ? heredado : decision === "conceder";
								return (
									<tr
										key={permiso.id}
										className={cn(
											decision !== "heredado" && "bg-aviso-suave/40",
										)}
									>
										<th
											scope="row"
											className="px-3 py-2 text-left font-normal capitalize"
										>
											{permiso.accion}
										</th>
										<td className="hidden px-3 py-2 text-center sm:table-cell">
											{heredado ? (
												<Check
													className="mx-auto size-4 text-tinta-suave"
													aria-label="Sí"
												/>
											) : (
												<Minus
													className="mx-auto size-4 text-tinta-tenue"
													aria-label="No"
												/>
											)}
										</td>
										<td className="px-3 py-2">
											<fieldset className="inline-flex rounded-md bg-elevada p-0.5">
												<legend className="sr-only">
													{`${permiso.recurso}:${permiso.accion}`}
												</legend>
												{OPCIONES.map((o) => (
													<label
														key={o.valor}
														className={cn(
															"cursor-pointer rounded-sm px-2 py-1 text-xs transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-acento",
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
										</td>
										<td className="px-3 py-2 text-center">
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
										</td>
									</tr>
								);
							})}
						</tbody>
					))}
				</table>
			</div>
		</div>
	);
}
