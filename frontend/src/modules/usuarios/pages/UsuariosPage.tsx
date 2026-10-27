import { useState } from "react";
import { useUsuariosQuery } from "../hooks/useUsuariosQuery";
import { UsuariosTable } from "../components/UsuariosTable";
import { Input } from "@/core/components/ui/Input";
import type { Usuario } from "@/core/auth/types";
import { AsignacionUsuarioPanel } from "@/modules/roles/components/AsignacionUsuarioPanel";
import { Search, Users as UsersIcon } from "lucide-react";

export function UsuariosPage() {
	const [pagina, setPagina] = useState(1);
	const [emailBusqueda, setEmailBusqueda] = useState("");
	const [seleccionado, setSeleccionado] = useState<Usuario | null>(null);

	const { data, isLoading, error } = useUsuariosQuery({
		pagina,
		limite: 5,
		email: emailBusqueda.trim() ? emailBusqueda.trim() : undefined,
	});

	return (
		<div className="space-y-6">
			{/* Encabezado */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<div className="flex items-center gap-2.5">
						<div className="p-2 rounded-lg bg-indigo-600/10 border border-indigo-500/20 text-indigo-400">
							<UsersIcon className="h-5 w-5" />
						</div>
						<h1 className="text-2xl font-bold tracking-tight text-tinta">
							Gestión de Usuarios
						</h1>
					</div>
					<p className="mt-1 text-sm text-tinta-tenue">
						Consulta y administra los usuarios registrados en el sistema.
					</p>
				</div>

				<div className="w-full sm:w-72">
					<div className="relative">
						<Input
							type="text"
							placeholder="Buscar por email..."
							value={emailBusqueda}
							onChange={(e) => {
								setEmailBusqueda(e.target.value);
								setPagina(1); // Reset a primera página al buscar
							}}
							className="pl-9"
						/>
						<Search className="absolute left-3 top-2.5 h-4 w-4 text-tinta-tenue pointer-events-none" />
					</div>
				</div>
			</div>

			{/* Tabla de Usuarios con TanStack Query */}
			<UsuariosTable
				pagina={data}
				isLoading={isLoading}
				error={error}
				onCambioPagina={setPagina}
				onGestionarPermisos={setSeleccionado}
			/>

			<AsignacionUsuarioPanel
				key={seleccionado?.id}
				usuario={seleccionado}
				onCerrar={() => setSeleccionado(null)}
			/>
		</div>
	);
}
