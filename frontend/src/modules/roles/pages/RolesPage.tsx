import { AlertCircle } from "lucide-react";
import { Encabezado } from "@/core/components/layout/Encabezado";
import { getErrorMessage } from "@/core/api/client";
import { Card } from "@/core/components/ui/Card";
import { Spinner } from "@/core/components/ui/Spinner";
import { CrearRolForm } from "../components/CrearRolForm";
import { RolCard } from "../components/RolCard";
import { usePermisosQuery, useRolesQuery } from "../hooks/useRolesQuery";

export function RolesPage() {
	const roles = useRolesQuery();
	const permisos = usePermisosQuery();
	const error = roles.error ?? permisos.error;

	return (
		<div className="space-y-6">
			<Encabezado
				titulo="Roles y permisos"
				descripcion="Define qué permisos concede cada rol. Los roles se asignan a cada usuario desde Usuarios."
			/>

			<Card>
				<CrearRolForm />
			</Card>

			{error ? (
				<div className="flex items-center gap-3 rounded-xl border border-peligro-borde bg-peligro-suave p-4 text-sm text-peligro-tinta">
					<AlertCircle className="h-5 w-5 shrink-0" />
					{getErrorMessage(error)}
				</div>
			) : roles.isLoading || permisos.isLoading ? (
				<div className="flex justify-center py-16">
					<Spinner size="lg" className="text-acento-tinta" />
				</div>
			) : (
				<div className="space-y-4">
					{roles.data?.map((rol) => (
						<RolCard key={rol.id} rol={rol} permisos={permisos.data ?? []} />
					))}
				</div>
			)}
		</div>
	);
}
