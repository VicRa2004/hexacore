import { AlertCircle, ShieldCheck } from "lucide-react";
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
			<div>
				<div className="flex items-center gap-2.5">
					<div className="p-2 rounded-lg bg-indigo-600/10 border border-indigo-500/20 text-indigo-400">
						<ShieldCheck className="h-5 w-5" />
					</div>
					<h1 className="text-2xl font-bold tracking-tight text-tinta">
						Roles y permisos
					</h1>
				</div>
				<p className="mt-1 text-sm text-tinta-tenue">
					Define qué permisos concede cada rol. Los roles se asignan a cada
					usuario desde Usuarios.
				</p>
			</div>

			<Card>
				<CrearRolForm />
			</Card>

			{error ? (
				<div className="flex items-center gap-3 rounded-xl border border-rose-900/40 bg-rose-950/20 p-4 text-sm text-rose-400">
					<AlertCircle className="h-5 w-5 shrink-0" />
					{getErrorMessage(error)}
				</div>
			) : roles.isLoading || permisos.isLoading ? (
				<div className="flex justify-center py-16">
					<Spinner size="lg" className="text-indigo-500" />
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
