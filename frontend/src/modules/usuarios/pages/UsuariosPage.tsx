import { Search, UserPlus } from "lucide-react";
import { useState } from "react";
import type { Usuario } from "@/core/auth/types";
import { Encabezado } from "@/core/components/layout/Encabezado";
import { Button } from "@/core/components/ui/Button";
import { Input } from "@/core/components/ui/Input";
import { AsignacionUsuarioPanel } from "@/modules/roles/components/AsignacionUsuarioPanel";
import { UsuarioDialog } from "../components/UsuarioForm";
import { UsuariosTable } from "../components/UsuariosTable";
import { useUsuariosQuery } from "../hooks/useUsuariosQuery";

/** `null` = cerrado; `"nuevo"` = alta; un usuario = edición. */
type Edicion = Usuario | "nuevo" | null;

export function UsuariosPage() {
	const [pagina, setPagina] = useState(1);
	const [emailBusqueda, setEmailBusqueda] = useState("");
	const [seleccionado, setSeleccionado] = useState<Usuario | null>(null);
	const [edicion, setEdicion] = useState<Edicion>(null);

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
					<Button onClick={() => setEdicion("nuevo")}>
						<UserPlus />
						Nuevo usuario
					</Button>
				}
			/>

			<div className="relative w-full sm:w-80">
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

			<UsuariosTable
				pagina={data}
				isLoading={isLoading}
				error={error}
				onCambioPagina={setPagina}
				onGestionarPermisos={setSeleccionado}
				onEditar={setEdicion}
			/>

			<UsuarioDialog
				abierto={edicion !== null}
				usuario={edicion === "nuevo" ? null : edicion}
				onCerrar={() => setEdicion(null)}
			/>

			<AsignacionUsuarioPanel
				key={seleccionado?.id}
				usuario={seleccionado}
				onCerrar={() => setSeleccionado(null)}
			/>
		</div>
	);
}
