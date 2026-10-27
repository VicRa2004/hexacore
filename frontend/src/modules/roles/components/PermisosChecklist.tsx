import type { PermisoDto } from "../api/rolesApi";
import { agruparPorRecurso } from "../utils/agruparPorRecurso";

interface PermisosChecklistProps {
	permisos: PermisoDto[];
	seleccionados: Set<number>;
	onToggle: (permisoId: number) => void;
}

/** Casillas de permisos agrupadas por recurso. */
export function PermisosChecklist({
	permisos,
	seleccionados,
	onToggle,
}: PermisosChecklistProps) {
	return (
		<div className="grid gap-3 sm:grid-cols-2">
			{agruparPorRecurso(permisos).map(([recurso, delRecurso]) => (
				<fieldset
					key={recurso}
					className="rounded-lg border border-slate-800 bg-slate-950/40 p-3"
				>
					<legend className="px-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
						{recurso}
					</legend>
					<div className="flex flex-wrap gap-x-4 gap-y-2">
						{delRecurso.map((permiso) => (
							<label
								key={permiso.id}
								className="flex items-center gap-2 text-sm text-slate-200 cursor-pointer"
							>
								<input
									type="checkbox"
									className="h-4 w-4 accent-indigo-500"
									checked={seleccionados.has(permiso.id)}
									onChange={() => onToggle(permiso.id)}
								/>
								{permiso.accion}
							</label>
						))}
					</div>
				</fieldset>
			))}
		</div>
	);
}
