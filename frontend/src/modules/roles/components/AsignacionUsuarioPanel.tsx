import { useState } from "react";
import { Save, X } from "lucide-react";
import { getErrorMessage } from "@/core/api/client";
import type { Usuario } from "@/core/auth/types";
import { Button } from "@/core/components/ui/Button";
import { Card, CardDescription, CardTitle } from "@/core/components/ui/Card";
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
	usuario: Usuario;
	onCerrar: () => void;
}

/** Roles y excepciones de permisos (conceder / denegar) de un usuario. */
export function AsignacionUsuarioPanel({
	usuario,
	onCerrar,
}: AsignacionUsuarioPanelProps) {
	const roles = useRolesQuery();
	const permisos = usePermisosQuery();
	const asignacion = useAsignacionQuery(usuario.id);
	const error = roles.error ?? permisos.error ?? asignacion.error;

	return (
		<Card className="space-y-4">
			<div className="flex items-start justify-between gap-4">
				<div>
					<CardTitle className="text-lg">
						Permisos de {usuario.nombre}
					</CardTitle>
					<CardDescription>{usuario.email}</CardDescription>
				</div>
				<Button variant="ghost" size="sm" onClick={onCerrar} title="Cerrar">
					<X className="h-4 w-4" />
				</Button>
			</div>

			{error ? (
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
			)}
		</Card>
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
				<legend className="text-xs font-semibold uppercase tracking-wider text-slate-300">
					Roles
				</legend>
				<div className="flex flex-wrap gap-x-5 gap-y-2">
					{roles.map((rol) => (
						<label
							key={rol.id}
							className="flex items-center gap-2 text-sm text-slate-200 cursor-pointer"
						>
							<input
								type="checkbox"
								className="h-4 w-4 accent-indigo-500"
								checked={rolIds.has(rol.id)}
								onChange={() => toggleRol(rol.id)}
							/>
							{rol.nombre}
						</label>
					))}
				</div>
			</fieldset>

			<fieldset className="space-y-2">
				<legend className="text-xs font-semibold uppercase tracking-wider text-slate-300">
					Excepciones de permisos
				</legend>
				<p className="text-xs text-slate-400">
					«Según roles» no cambia nada; «Conceder» y «Denegar» ganan a lo que
					digan sus roles.
				</p>
				<div className="grid gap-3 sm:grid-cols-2">
					{agruparPorRecurso(permisos).map(([recurso, delRecurso]) => (
						<div
							key={recurso}
							className="rounded-lg border border-slate-800 bg-slate-950/40 p-3 space-y-2"
						>
							<p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
								{recurso}
							</p>
							{delRecurso.map((permiso) => (
								<label
									key={permiso.id}
									className="flex items-center justify-between gap-3 text-sm text-slate-200"
								>
									{permiso.accion}
									<select
										className="rounded-md border border-slate-800 bg-slate-900 px-2 py-1 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
										value={decisiones.get(permiso.id) ?? "heredado"}
										onChange={(e) =>
											decidir(permiso.id, e.target.value as Decision)
										}
									>
										<option value="heredado">Según roles</option>
										<option value="conceder">Conceder</option>
										<option value="denegar">Denegar</option>
									</select>
								</label>
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
