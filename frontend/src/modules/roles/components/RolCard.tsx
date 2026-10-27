import { useState } from "react";
import { Save, Trash2 } from "lucide-react";
import { Button } from "@/core/components/ui/Button";
import { Card } from "@/core/components/ui/Card";
import { Input } from "@/core/components/ui/Input";
import type { PermisoDto, RolDto } from "../api/rolesApi";
import {
	useActualizarRolMutation,
	useEliminarRolMutation,
} from "../hooks/useRolesMutation";
import { PermisosChecklist } from "./PermisosChecklist";

interface RolCardProps {
	rol: RolDto;
	permisos: PermisoDto[];
}

/** Edición de un rol: nombre, descripción y permisos que concede. */
export function RolCard({ rol, permisos }: RolCardProps) {
	const [nombre, setNombre] = useState(rol.nombre);
	const [descripcion, setDescripcion] = useState(rol.descripcion ?? "");
	const [seleccionados, setSeleccionados] = useState(
		() => new Set(rol.permisos.map((p) => p.id)),
	);
	const actualizar = useActualizarRolMutation();
	const eliminar = useEliminarRolMutation();

	const toggle = (permisoId: number) =>
		setSeleccionados((actual) => {
			const siguiente = new Set(actual);
			if (!siguiente.delete(permisoId)) siguiente.add(permisoId);
			return siguiente;
		});

	const guardar = () =>
		actualizar.mutate({
			id: rol.id,
			datos: {
				nombre,
				descripcion: descripcion.trim() || null,
				permisoIds: [...seleccionados],
			},
		});

	const borrar = () => {
		if (window.confirm(`¿Eliminar el rol ${rol.nombre}?`)) {
			eliminar.mutate(rol.id);
		}
	};

	return (
		<Card className="space-y-4">
			<div className="grid gap-3 sm:grid-cols-[1fr_2fr]">
				<Input
					id={`rol-${rol.id}-nombre`}
					label="Nombre"
					value={nombre}
					onChange={(e) => setNombre(e.target.value)}
				/>
				<Input
					id={`rol-${rol.id}-descripcion`}
					label="Descripción"
					value={descripcion}
					onChange={(e) => setDescripcion(e.target.value)}
				/>
			</div>

			<PermisosChecklist
				permisos={permisos}
				seleccionados={seleccionados}
				onToggle={toggle}
			/>

			<div className="flex justify-end gap-2">
				<Button
					variant="ghost"
					size="sm"
					onClick={borrar}
					isLoading={eliminar.isPending}
					className="text-rose-400 hover:bg-rose-950/20 hover:text-rose-300"
				>
					<Trash2 className="h-4 w-4" />
					Eliminar
				</Button>
				<Button
					size="sm"
					onClick={guardar}
					isLoading={actualizar.isPending}
					disabled={!nombre.trim()}
				>
					<Save className="h-4 w-4" />
					Guardar
				</Button>
			</div>
		</Card>
	);
}
