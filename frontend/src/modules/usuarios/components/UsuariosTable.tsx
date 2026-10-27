import { KeyRound, Shield, User as UserIcon } from "lucide-react";
import type { Usuario } from "@/core/auth/types";
import { Badge } from "@/core/components/ui/Badge";
import { Button } from "@/core/components/ui/Button";
import { EmptyState } from "@/core/components/ui/EmptyState";
import { type Columna, type Pagina, Tabla } from "@/core/components/ui/Table";

interface UsuariosTableProps {
	pagina?: Pagina<Usuario>;
	isLoading: boolean;
	error?: unknown;
	onCambioPagina: (pagina: number) => void;
	onGestionarPermisos: (usuario: Usuario) => void;
}

const varianteRol = (roles: string[]) =>
	roles.includes("ADMIN")
		? "purple"
		: roles.includes("MOD")
			? "warning"
			: "default";

export function UsuariosTable({
	pagina,
	isLoading,
	error,
	onCambioPagina,
	onGestionarPermisos,
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
					{u.avatarUrl ? (
						<img
							src={u.avatarUrl}
							alt=""
							className="h-8 w-8 rounded-full object-cover"
						/>
					) : (
						<div className="flex h-8 w-8 items-center justify-center rounded-full bg-elevada text-xs font-semibold text-indigo-400">
							{u.nombre.charAt(0).toUpperCase()}
						</div>
					)}
					<span>{u.nombre}</span>
				</div>
			),
		},
		{ cabecera: "Correo", celda: (u) => u.email },
		{
			cabecera: "Rol",
			celda: (u) => (
				<Badge variant={varianteRol(u.roles)} className="gap-1">
					<Shield className="h-3 w-3" />
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
			celda: (u) => (
				<Button
					variant="outline"
					size="sm"
					onClick={() => onGestionarPermisos(u)}
				>
					<KeyRound className="h-3.5 w-3.5" />
					Permisos
				</Button>
			),
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
