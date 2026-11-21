import { useState } from "react";
import { Save } from "lucide-react";
import { getErrorMessage } from "@/core/api/client";
import { usePermisos } from "@/core/auth/permisos";
import type { Usuario } from "@/core/auth/types";
import { Button } from "@/core/components/ui/Button";
import { Checkbox } from "@/core/components/ui/Checkbox";
import { Dialog } from "@/core/components/ui/Dialog";
import { Spinner } from "@/core/components/ui/Spinner";
import type { AsignacionUsuario, PermisoDto, RolDto } from "../api/rolesApi";
import { useActualizarAsignacionMutation } from "../hooks/useRolesMutation";
import {
	useAsignacionQuery,
	usePermisosQuery,
	useRolesQuery,
} from "../hooks/useRolesQuery";
import { type Decision, ExcepcionesPermisos } from "./ExcepcionesPermisos";

interface AsignacionUsuarioPanelProps {
	/** `null` = cerrado. */
	usuario: Usuario | null;
	onCerrar: () => void;
}

/** Modal con los roles y excepciones de permisos (conceder / denegar) de un usuario. */
export function AsignacionUsuarioPanel({
	usuario,
	onCerrar,
}: AsignacionUsuarioPanelProps) {
	return (
		<Dialog
			abierto={!!usuario}
			onCerrar={onCerrar}
			titulo={usuario ? `Permisos de ${usuario.nombre}` : ""}
			descripcion={usuario?.email}
			className="max-w-4xl"
		>
			{usuario && <Contenido usuario={usuario} />}
		</Dialog>
	);
}

function Contenido({ usuario }: { usuario: Usuario }) {
	const roles = useRolesQuery();
	const permisos = usePermisosQuery();
	const asignacion = useAsignacionQuery(usuario.id);
	const error = roles.error ?? permisos.error ?? asignacion.error;

	return error ? (
		<p className="text-sm text-peligro-tinta">{getErrorMessage(error)}</p>
	) : roles.data && permisos.data && asignacion.data ? (
		<Formulario
			usuarioId={usuario.id}
			roles={roles.data}
			permisos={permisos.data}
			inicial={asignacion.data}
		/>
	) : (
		<div className="flex justify-center py-8">
			<Spinner className="text-acento-tinta" />
		</div>
	);
}

function Formulario({
	usuarioId,
	roles,
	permisos,
	inicial,
}: {
	usuarioId: number;
	roles: RolDto[];
	permisos: PermisoDto[];
	inicial: AsignacionUsuario;
}) {
	const [rolIds, setRolIds] = useState(() => new Set(inicial.rolIds));
	const [decisiones, setDecisiones] = useState(
		() =>
			new Map<number, Decision>(
				inicial.permisosDirectos.map((p) => [
					p.permisoId,
					p.concedido ? "conceder" : "denegar",
				]),
			),
	);
	const guardar = useActualizarAsignacionMutation(usuarioId);
	const editable = usePermisos().puede("asignaciones:actualizar");
	const porRoles = new Set(
		roles
			.filter((r) => rolIds.has(r.id))
			.flatMap((r) => r.permisos.map((p) => p.id)),
	);

	const toggleRol = (id: number) =>
		setRolIds((actual) => {
			const siguiente = new Set(actual);
			if (!siguiente.delete(id)) siguiente.add(id);
			return siguiente;
		});

	const decidir = (permisoId: number, decision: Decision) =>
		setDecisiones((actual) => new Map(actual).set(permisoId, decision));

	const enviar = () =>
		guardar.mutate({
			rolIds: [...rolIds],
			permisosDirectos: [...decisiones]
				.filter(([, decision]) => decision !== "heredado")
				.map(([permisoId, decision]) => ({
					permisoId,
					concedido: decision === "conceder",
				})),
		});

	return (
		// Sin asignaciones:actualizar se ve todo pero no se puede cambiar.
		<fieldset disabled={!editable} className="space-y-5">
			<fieldset className="space-y-2">
				<legend className="text-xs font-semibold uppercase tracking-wider text-tinta-suave">
					Roles
				</legend>
				<div className="flex flex-wrap gap-x-5 gap-y-2">
					{roles.map((rol) => (
						<Checkbox
							key={rol.id}
							label={rol.nombre}
							checked={rolIds.has(rol.id)}
							onChange={() => toggleRol(rol.id)}
						/>
					))}
				</div>
			</fieldset>

			<section className="space-y-2">
				<h3 className="text-xs font-semibold uppercase tracking-wider text-tinta-suave">
					Excepciones de permisos
				</h3>
				<ExcepcionesPermisos
					permisos={permisos}
					porRoles={porRoles}
					decisiones={decisiones}
					onDecidir={decidir}
				/>
			</section>

			{editable && (
				<div className="flex justify-end">
					<Button size="sm" onClick={enviar} isLoading={guardar.isPending}>
						<Save className="h-4 w-4" />
						Guardar
					</Button>
				</div>
			)}
		</fieldset>
	);
}
