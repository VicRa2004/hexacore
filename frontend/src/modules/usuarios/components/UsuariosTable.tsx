import { Shield, User as UserIcon } from "lucide-react";
import { varianteRol } from "@/core/auth/rol";
import type { Usuario } from "@/core/auth/types";
import { Avatar } from "@/core/components/ui/Avatar";
import { Badge } from "@/core/components/ui/Badge";
import { EmptyState } from "@/core/components/ui/EmptyState";
import { type Columna, type Pagina, Tabla } from "@/core/components/ui/Table";
import { type AccionUsuario, AccionesUsuario } from "./AccionesUsuario";

interface UsuariosTableProps {
	pagina?: Pagina<Usuario>;
	isLoading: boolean;
	error?: unknown;
	onCambioPagina: (pagina: number) => void;
	onAccion: (accion: AccionUsuario, usuario: Usuario) => void;
}

export function UsuariosTable({
	pagina,
	isLoading,
	error,
	onCambioPagina,
	onAccion,
}: UsuariosTableProps) {
	const columnas: Columna<Usuario>[] = [
		{
			cabecera: "ID",
			celda: (u) => `#${u.id}`,
			className: "font-mono text-xs text-tinta-tenue",
		},
		{
			cabecera: "Usuario",
			className: "font-medium text-tinta",
			celda: (u) => (
				<div className="flex items-center gap-2.5">
					<Avatar nombre={u.nombre} src={u.avatarUrl} size="sm" />
					<span>{u.nombre}</span>
				</div>
			),
		},
		{ cabecera: "Correo", celda: (u) => u.email },
		{
			cabecera: "Rol",
			celda: (u) => (
				<Badge variant={varianteRol(u.roles)}>
					<Shield className="size-3" />
					{u.roles.join(", ")}
				</Badge>
			),
		},
		{
			cabecera: "Estado",
			celda: (u) => (
				<Badge variant={u.isActivo ? "success" : "danger"}>
					{u.isActivo ? "Activo" : "Inactivo"}
				</Badge>
			),
		},
		{
			cabecera: <span className="sr-only">Acciones</span>,
			className: "text-right",
			celda: (u) => <AccionesUsuario usuario={u} onAccion={onAccion} />,
		},
	];

	return (
		<Tabla
			etiqueta="Usuarios"
			columnas={columnas}
			datos={pagina}
			clave={(u) => u.id}
			onCambioPagina={onCambioPagina}
			isLoading={isLoading}
			error={error}
			vacio={
				<EmptyState
					icono={UserIcon}
					titulo="No se encontraron usuarios"
					descripcion="Intenta ajustar los filtros de búsqueda."
				/>
			}
		/>
	);
}
