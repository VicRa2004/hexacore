import { Shield, User as UserIcon } from "lucide-react";
import { type ReactNode, useMemo } from "react";
import { varianteRol } from "@/core/auth/rol";
import type { Usuario } from "@/core/auth/types";
import { Avatar } from "@/core/components/ui/Avatar";
import { Badge } from "@/core/components/ui/Badge";
import { EmptyState } from "@/core/components/ui/EmptyState";
import {
	type Columna,
	type OrdenTabla,
	type Pagina,
	Tabla,
} from "@/core/components/ui/Table";
import { type AccionUsuario, AccionesUsuario } from "./AccionesUsuario";

interface UsuariosTableProps {
	pagina?: Pagina<Usuario>;
	isLoading: boolean;
	error?: unknown;
	onCambioPagina: (pagina: number) => void;
	orden?: OrdenTabla;
	onCambioOrden?: (orden: OrdenTabla) => void;
	seleccionable?: boolean;
	puedeSeleccionar?: (usuario: Usuario) => boolean;
	accionesEnBloque?: (
		seleccionados: Usuario[],
		limpiar: () => void,
	) => ReactNode;
	onAccion: (accion: AccionUsuario, usuario: Usuario) => void;
}

export function UsuariosTable({
	pagina,
	isLoading,
	error,
	onCambioPagina,
	orden,
	onCambioOrden,
	seleccionable,
	puedeSeleccionar,
	accionesEnBloque,
	onAccion,
}: UsuariosTableProps) {
	const columnas = useMemo<Columna<Usuario>[]>(
		() => [
			{
				id: "id",
				cabecera: "ID",
				ordenable: true,
				celda: (u) => `#${u.id}`,
				className: "font-mono text-xs text-tinta-tenue",
			},
			{
				id: "nombre",
				cabecera: "Usuario",
				ordenable: true,
				className: "font-medium text-tinta",
				celda: (u) => (
					<div className="flex items-center gap-2.5">
						<Avatar nombre={u.nombre} src={u.avatarUrl} size="sm" />
						<span>{u.nombre}</span>
					</div>
				),
			},
			{
				id: "email",
				cabecera: "Correo",
				ordenable: true,
				celda: (u) => u.email,
			},
			{
				id: "roles",
				cabecera: "Rol",
				celda: (u) => (
					<Badge variant={varianteRol(u.roles)}>
						<Shield className="size-3" />
						{u.roles.join(", ")}
					</Badge>
				),
			},
			{
				id: "isActivo",
				cabecera: "Estado",
				ordenable: true,
				celda: (u) => (
					<Badge variant={u.isActivo ? "success" : "danger"}>
						{u.isActivo ? "Activo" : "Inactivo"}
					</Badge>
				),
			},
			{
				id: "acciones",
				cabecera: <span className="sr-only">Acciones</span>,
				ocultable: false,
				className: "text-right",
				celda: (u) => <AccionesUsuario usuario={u} onAccion={onAccion} />,
			},
		],
		[onAccion],
	);

	return (
		<Tabla
			tablaId="usuarios"
			etiqueta="Usuarios"
			columnas={columnas}
			datos={pagina}
			clave={(u) => u.id}
			onCambioPagina={onCambioPagina}
			orden={orden}
			onCambioOrden={onCambioOrden}
			seleccionable={seleccionable}
			puedeSeleccionar={puedeSeleccionar}
			accionesEnBloque={accionesEnBloque}
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
