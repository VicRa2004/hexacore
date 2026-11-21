import { useState } from "react";
import { useUsuariosQuery } from "../hooks/useUsuariosQuery";
import { UsuariosTable } from "../components/UsuariosTable";
import { Input } from "@/core/components/ui/Input";
import type { Usuario } from "@/core/auth/types";
import { AsignacionUsuarioPanel } from "@/modules/roles/components/AsignacionUsuarioPanel";
import { Search } from "lucide-react";
import { Encabezado } from "@/core/components/layout/Encabezado";

export function UsuariosPage() {
	const [pagina, setPagina] = useState(1);
	const [emailBusqueda, setEmailBusqueda] = useState("");
	const [seleccionado, setSeleccionado] = useState<Usuario | null>(null);

	const { data, isLoading, error } = useUsuariosQuery({
		pagina,
		limite: 10,
		email: emailBusqueda.trim() ? emailBusqueda.trim() : undefined,
	});

	return (
		<div className="space-y-6">
			<Encabezado
				titulo="Usuarios"
				descripcion="Consulta y administra los usuarios registrados en el sistema."
				acciones={
					<div className="relative w-full sm:w-72">
						<Input
							type="search"
							aria-label="Buscar por email"
							placeholder="Buscar por email…"
							value={emailBusqueda}
							onChange={(e) => {
								setEmailBusqueda(e.target.value);
								setPagina(1); // Reset a primera página al buscar
							}}
							className="pl-9"
						/>
						<Search className="pointer-events-none absolute top-2.5 left-3 size-4 text-tinta-tenue" />
					</div>
				}
			/>

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
