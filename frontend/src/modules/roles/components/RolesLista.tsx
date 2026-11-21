import { ShieldCheck } from "lucide-react";
import { cn } from "@/core/utils/cn";
import type { RolDto } from "../api/rolesApi";

interface RolesListaProps {
	roles: RolDto[];
	totalPermisos: number;
	seleccionadoId?: number;
	onSeleccionar: (id: number) => void;
}

/** Columna maestra: cada rol con su cobertura de permisos. */
export function RolesLista({
	roles,
	totalPermisos,
	seleccionadoId,
	onSeleccionar,
}: RolesListaProps) {
	return (
		<nav aria-label="Roles" className="space-y-1.5">
			{roles.map((rol) => {
				const activo = rol.id === seleccionadoId;
				const cobertura = totalPermisos
					? (rol.permisos.length / totalPermisos) * 100
					: 0;
				return (
					<button
						key={rol.id}
						type="button"
						aria-current={activo ? "true" : undefined}
						onClick={() => onSeleccionar(rol.id)}
						className={cn(
							"w-full cursor-pointer rounded-lg border p-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-acento",
							activo
								? "border-acento-borde bg-acento-suave"
								: "border-borde bg-superficie hover:border-borde-fuerte hover:bg-elevada/50",
						)}
					>
						<span className="flex items-center gap-2 text-sm font-semibold">
							<ShieldCheck
								className={cn(
									"size-4 shrink-0",
									activo ? "text-acento-tinta" : "text-tinta-tenue",
								)}
							/>
							<span className="truncate">{rol.nombre}</span>
							<span className="ml-auto text-xs font-normal text-tinta-tenue tabular-nums">
								{rol.permisos.length}/{totalPermisos}
							</span>
						</span>
						{rol.descripcion && (
							<span className="mt-1 line-clamp-2 block text-xs text-tinta-tenue">
								{rol.descripcion}
							</span>
						)}
						<span className="mt-2.5 block h-1 overflow-hidden rounded-full bg-elevada">
							<span
								className="block h-full rounded-full bg-acento"
								style={{ width: `${cobertura}%` }}
							/>
						</span>
					</button>
				);
			})}
		</nav>
	);
}
