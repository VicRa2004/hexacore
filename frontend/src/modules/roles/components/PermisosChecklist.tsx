import { Checkbox } from "@/core/components/ui/Checkbox";
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
					className="rounded-lg border border-borde bg-fondo/40 p-3"
				>
					<legend className="px-1 text-xs font-semibold uppercase tracking-wider text-tinta-tenue">
						{recurso}
					</legend>
					<div className="flex flex-wrap gap-x-4 gap-y-2">
						{delRecurso.map((permiso) => (
							<Checkbox
								key={permiso.id}
								label={permiso.accion}
								checked={seleccionados.has(permiso.id)}
								onChange={() => onToggle(permiso.id)}
							/>
						))}
					</div>
				</fieldset>
			))}
		</div>
	);
}
