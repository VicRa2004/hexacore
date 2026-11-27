import { AlertCircle } from "lucide-react";
import { getErrorMessage } from "@/core/api/client";
import { usePermisos } from "@/core/auth/permisos";
import { Encabezado } from "@/core/components/layout/Encabezado";
import { Skeleton } from "@/core/components/ui/Skeleton";
import { AjustesForm } from "../components/AjustesForm";
import { IdentidadVisualCard } from "../components/IdentidadVisualCard";
import { useAjustesQuery } from "../hooks/useAjustesQuery";

export function AjustesPage() {
	const { puede } = usePermisos();
	const puedeEditar = puede("ajustes:actualizar");
	const { data, isLoading, error } = useAjustesQuery();

	return (
		<div className="mx-auto max-w-3xl space-y-6">
			<Encabezado
				titulo="Ajustes del sistema"
				descripcion="Identidad visual, correo saliente y registro público de la plataforma."
			/>

			{error ? (
				<div className="flex items-center gap-3 rounded-xl border border-peligro-borde bg-peligro-suave p-4 text-sm text-peligro-tinta">
					<AlertCircle className="size-5 shrink-0" />
					{getErrorMessage(error)}
				</div>
			) : isLoading || !data ? (
				<div className="space-y-6">
					<Skeleton className="h-44" />
					<Skeleton className="h-56" />
					<Skeleton className="h-32" />
				</div>
			) : (
				<>
					<IdentidadVisualCard
						logoUrl={data.logoUrl}
						faviconUrl={data.faviconUrl}
						puedeEditar={puedeEditar}
					/>
					<AjustesForm ajustes={data} puedeEditar={puedeEditar} />
				</>
			)}
		</div>
	);
}
