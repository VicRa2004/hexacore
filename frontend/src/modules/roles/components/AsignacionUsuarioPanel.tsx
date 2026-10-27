import { useState } from "react";
import { Save } from "lucide-react";
import { getErrorMessage } from "@/core/api/client";
import type { Usuario } from "@/core/auth/types";
import { Button } from "@/core/components/ui/Button";
import { Checkbox } from "@/core/components/ui/Checkbox";
import { Dialog } from "@/core/components/ui/Dialog";
import { Select } from "@/core/components/ui/Select";
import { Spinner } from "@/core/components/ui/Spinner";
import type { AsignacionUsuario, PermisoDto, RolDto } from "../api/rolesApi";
import { useActualizarAsignacionMutation } from "../hooks/useRolesMutation";
import {
	useAsignacionQuery,
	usePermisosQuery,
	useRolesQuery,
} from "../hooks/useRolesQuery";
import { agruparPorRecurso } from "../utils/agruparPorRecurso";

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
			className="max-w-3xl"
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
		<p className="text-sm text-rose-400">{getErrorMessage(error)}</p>
	) : roles.data && permisos.data && asignacion.data ? (
		<Formulario
			usuarioId={usuario.id}
			roles={roles.data}
			permisos={permisos.data}
			inicial={asignacion.data}
		/>
	) : (
		<div className="flex justify-center py-8">
			<Spinner className="text-indigo-500" />
		</div>
	);
}

type Decision = "heredado" | "conceder" | "denegar";

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
		<div className="space-y-5">
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

			<fieldset className="space-y-2">
				<legend className="text-xs font-semibold uppercase tracking-wider text-tinta-suave">
					Excepciones de permisos
				</legend>
				<p className="text-xs text-tinta-tenue">
					«Según roles» no cambia nada; «Conceder» y «Denegar» ganan a lo que
					digan sus roles.
				</p>
				<div className="grid gap-3 sm:grid-cols-2">
					{agruparPorRecurso(permisos).map(([recurso, delRecurso]) => (
						<div
							key={recurso}
							className="rounded-lg border border-borde bg-fondo/40 p-3 space-y-2"
						>
							<p className="text-xs font-semibold uppercase tracking-wider text-tinta-tenue">
								{recurso}
							</p>
							{delRecurso.map((permiso) => (
								<div
									key={permiso.id}
									className="flex items-center justify-between gap-3 text-sm text-tinta"
								>
									<label htmlFor={`decision-${permiso.id}`}>
										{permiso.accion}
									</label>
									<Select
										id={`decision-${permiso.id}`}
										className="w-36 py-1 text-xs"
										value={decisiones.get(permiso.id) ?? "heredado"}
										onChange={(e) =>
											decidir(permiso.id, e.target.value as Decision)
										}
									>
										<option value="heredado">Según roles</option>
										<option value="conceder">Conceder</option>
										<option value="denegar">Denegar</option>
									</Select>
								</div>
							))}
						</div>
					))}
				</div>
			</fieldset>

			<div className="flex justify-end">
				<Button size="sm" onClick={enviar} isLoading={guardar.isPending}>
					<Save className="h-4 w-4" />
					Guardar
				</Button>
			</div>
		</div>
	);
}
