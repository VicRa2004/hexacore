import { AlertCircle, Plus, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { getErrorMessage } from "@/core/api/client";
import { Encabezado } from "@/core/components/layout/Encabezado";
import { Button } from "@/core/components/ui/Button";
import { Dialog } from "@/core/components/ui/Dialog";
import { EmptyState } from "@/core/components/ui/EmptyState";
import { Skeleton } from "@/core/components/ui/Skeleton";
import { CrearRolForm } from "../components/CrearRolForm";
import { RolEditor } from "../components/RolEditor";
import { RolesLista } from "../components/RolesLista";
import { usePermisosQuery, useRolesQuery } from "../hooks/useRolesQuery";

export function RolesPage() {
	const roles = useRolesQuery();
	const permisos = usePermisosQuery();
	const error = roles.error ?? permisos.error;
	const [seleccionadoId, setSeleccionadoId] = useState<number>();
	const [creando, setCreando] = useState(false);

	const lista = roles.data ?? [];
	const rol = lista.find((r) => r.id === seleccionadoId) ?? lista[0];

	return (
		<div className="space-y-6">
			<Encabezado
				titulo="Roles y permisos"
				descripcion="Elige un rol para ver y editar sus permisos. Los roles se asignan a cada usuario desde Usuarios."
				acciones={
					<Button onClick={() => setCreando(true)}>
						<Plus />
						Nuevo rol
					</Button>
				}
			/>

			{error ? (
				<div className="flex items-center gap-3 rounded-xl border border-peligro-borde bg-peligro-suave p-4 text-sm text-peligro-tinta">
					<AlertCircle className="h-5 w-5 shrink-0" />
					{getErrorMessage(error)}
				</div>
			) : roles.isLoading || permisos.isLoading ? (
				<div className="grid grid-cols-1 gap-6 lg:grid-cols-[17rem_1fr]">
					<Skeleton className="h-64" />
					<Skeleton className="h-96" />
				</div>
			) : !rol ? (
				<EmptyState
					icono={ShieldCheck}
					titulo="Aún no hay roles"
					descripcion="Crea el primero y marca qué permisos concede."
					accion={
						<Button size="sm" onClick={() => setCreando(true)}>
							<Plus />
							Nuevo rol
						</Button>
					}
				/>
			) : (
				<div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[17rem_1fr]">
					<RolesLista
						roles={lista}
						totalPermisos={permisos.data?.length ?? 0}
						seleccionadoId={rol.id}
						onSeleccionar={setSeleccionadoId}
					/>
					<RolEditor
						key={rol.id}
						rol={rol}
						permisos={permisos.data ?? []}
						onEliminado={() => setSeleccionadoId(undefined)}
					/>
				</div>
			)}

			<Dialog
				abierto={creando}
				onCerrar={() => setCreando(false)}
				titulo="Nuevo rol"
				descripcion="Después de crearlo, marca sus permisos en la matriz."
			>
				{creando && (
					<CrearRolForm
						onCreado={(id) => {
							setSeleccionadoId(id);
							setCreando(false);
						}}
						onCancelar={() => setCreando(false)}
					/>
				)}
			</Dialog>
		</div>
	);
}
