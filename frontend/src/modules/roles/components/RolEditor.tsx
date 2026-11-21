import { RotateCcw, Save, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/core/components/ui/Button";
import { Card } from "@/core/components/ui/Card";
import { ConfirmDialog } from "@/core/components/ui/ConfirmDialog";
import { Input } from "@/core/components/ui/Input";
import type { PermisoDto, RolDto } from "../api/rolesApi";
import {
	useActualizarRolMutation,
	useEliminarRolMutation,
} from "../hooks/useRolesMutation";
import { PermisosMatriz } from "./PermisosMatriz";

interface RolEditorProps {
	rol: RolDto;
	permisos: PermisoDto[];
	onEliminado: () => void;
}

const mismos = (a: Set<number>, b: Set<number>) =>
	a.size === b.size && [...a].every((id) => b.has(id));

/** Detalle de un rol: datos y matriz de permisos con guardado explícito. Montar con `key={rol.id}`. */
export function RolEditor({ rol, permisos, onEliminado }: RolEditorProps) {
	const inicial = new Set(rol.permisos.map((p) => p.id));
	const [nombre, setNombre] = useState(rol.nombre);
	const [descripcion, setDescripcion] = useState(rol.descripcion ?? "");
	const [seleccionados, setSeleccionados] = useState(inicial);
	const [confirmando, setConfirmando] = useState(false);
	const actualizar = useActualizarRolMutation();
	const eliminar = useEliminarRolMutation();

	const sucio =
		nombre !== rol.nombre ||
		descripcion !== (rol.descripcion ?? "") ||
		!mismos(seleccionados, inicial);

	const cambiar = (ids: number[], marcar: boolean) =>
		setSeleccionados((actual) => {
			const siguiente = new Set(actual);
			for (const id of ids) {
				if (marcar) siguiente.add(id);
				else siguiente.delete(id);
			}
			return siguiente;
		});

	const descartar = () => {
		setNombre(rol.nombre);
		setDescripcion(rol.descripcion ?? "");
		setSeleccionados(inicial);
	};

	const guardar = () =>
		actualizar.mutate({
			id: rol.id,
			datos: {
				nombre: nombre.trim(),
				descripcion: descripcion.trim() || null,
				permisoIds: [...seleccionados],
			},
		});

	return (
		<Card className="space-y-5 p-0">
			<div className="grid gap-3 px-6 pt-6 sm:grid-cols-[1fr_2fr]">
				<Input
					id={`rol-${rol.id}-nombre`}
					label="Nombre"
					placeholder="SOPORTE"
					value={nombre}
					onChange={(e) => setNombre(e.target.value)}
					error={nombre.trim() ? undefined : "El nombre es requerido"}
				/>
				<Input
					id={`rol-${rol.id}-descripcion`}
					label="Descripción"
					placeholder="Qué puede hacer quien tenga este rol"
					value={descripcion}
					onChange={(e) => setDescripcion(e.target.value)}
				/>
			</div>

			<div className="space-y-2 px-6">
				<div className="flex items-baseline justify-between gap-3">
					<h3 className="text-sm font-semibold">Permisos</h3>
					<p className="text-xs text-tinta-tenue tabular-nums">
						{seleccionados.size} de {permisos.length} concedidos
					</p>
				</div>
				<PermisosMatriz
					permisos={permisos}
					seleccionados={seleccionados}
					onCambiar={cambiar}
				/>
			</div>

			<div className="flex flex-wrap items-center gap-2 rounded-b-xl border-t border-borde bg-elevada/40 px-6 py-3">
				<Button
					variant="ghost"
					size="sm"
					onClick={() => setConfirmando(true)}
					className="text-peligro-tinta hover:bg-peligro-suave hover:text-peligro-tinta"
				>
					<Trash2 />
					Eliminar rol
				</Button>
				<span className="ml-auto text-xs text-aviso-tinta" aria-live="polite">
					{sucio && "Cambios sin guardar"}
				</span>
				<Button variant="ghost" size="sm" onClick={descartar} disabled={!sucio}>
					<RotateCcw />
					Descartar
				</Button>
				<Button
					size="sm"
					onClick={guardar}
					isLoading={actualizar.isPending}
					disabled={!sucio || !nombre.trim()}
				>
					<Save />
					Guardar
				</Button>
			</div>

			<ConfirmDialog
				abierto={confirmando}
				titulo={`¿Eliminar el rol ${rol.nombre}?`}
				mensaje="Sus permisos dejan de aplicarse. No se puede eliminar si algún usuario lo tiene."
				textoConfirmar="Eliminar"
				peligroso
				isLoading={eliminar.isPending}
				onCancelar={() => setConfirmando(false)}
				onConfirmar={() =>
					eliminar.mutate(rol.id, {
						onSuccess: onEliminado,
						onSettled: () => setConfirmando(false),
					})
				}
			/>
		</Card>
	);
}
