import { useEffect, useRef } from "react";
import type { PermisoDto } from "../api/rolesApi";
import { matrizPermisos } from "../utils/matrizPermisos";

interface PermisosMatrizProps {
	permisos: PermisoDto[];
	seleccionados: Set<number>;
	/** Marca o desmarca varios a la vez (una celda, una fila o todo). */
	onCambiar: (ids: number[], marcar: boolean) => void;
}

/** Casilla con estado «a medias» (indeterminate solo existe por JS). */
function CasillaGrupo({
	ids,
	seleccionados,
	onCambiar,
	etiqueta,
}: {
	ids: number[];
	seleccionados: Set<number>;
	onCambiar: PermisosMatrizProps["onCambiar"];
	etiqueta: string;
}) {
	const ref = useRef<HTMLInputElement>(null);
	const marcados = ids.filter((id) => seleccionados.has(id)).length;
	const todos = marcados === ids.length && ids.length > 0;
	useEffect(() => {
		if (ref.current) ref.current.indeterminate = marcados > 0 && !todos;
	}, [marcados, todos]);
	return (
		<input
			ref={ref}
			type="checkbox"
			aria-label={etiqueta}
			checked={todos}
			onChange={() => onCambiar(ids, !todos)}
			className="size-4 cursor-pointer accent-acento"
		/>
	);
}

/** Tabla recurso × acción: se lee de un vistazo y se edita por celda, fila, columna o todo. */
export function PermisosMatriz({
	permisos,
	seleccionados,
	onCambiar,
}: PermisosMatrizProps) {
	const { acciones, filas } = matrizPermisos(permisos);
	const ids = (celdas: (PermisoDto | undefined)[]) =>
		celdas.flatMap((c) => (c ? [c.id] : []));

	return (
		<>
			{/* Móvil: un bloque por recurso con sus acciones como casillas. */}
			<div className="divide-y divide-borde rounded-lg border border-borde sm:hidden">
				<div className="flex items-center gap-3 bg-elevada/60 px-3 py-2.5 text-xs font-medium text-tinta-suave">
					<CasillaGrupo
						ids={permisos.map((p) => p.id)}
						seleccionados={seleccionados}
						onCambiar={onCambiar}
						etiqueta="Todos los permisos"
					/>
					<span aria-hidden>Todos los permisos</span>
				</div>
				{filas.map(({ recurso, celdas }) => {
					const delRecurso = ids(celdas);
					return (
						<fieldset key={recurso} className="space-y-2.5 px-3 py-3">
							<legend className="sr-only">{recurso}</legend>
							<div className="flex items-center gap-3 text-sm font-medium capitalize">
								<CasillaGrupo
									ids={delRecurso}
									seleccionados={seleccionados}
									onCambiar={onCambiar}
									etiqueta={`Todo ${recurso}`}
								/>
								{recurso}
								<span className="ml-auto text-xs font-normal text-tinta-tenue tabular-nums">
									{delRecurso.filter((id) => seleccionados.has(id)).length}/
									{delRecurso.length}
								</span>
							</div>
							<div className="flex flex-wrap gap-2 pl-7">
								{celdas.map(
									(permiso) =>
										permiso && (
											<label
												key={permiso.id}
												className="flex cursor-pointer items-center gap-2 rounded-md border border-borde px-2.5 py-1.5 text-xs capitalize has-checked:border-acento-borde has-checked:bg-acento-suave has-checked:text-acento-tinta"
											>
												<input
													type="checkbox"
													checked={seleccionados.has(permiso.id)}
													onChange={(e) =>
														onCambiar([permiso.id], e.target.checked)
													}
													className="size-3.5 cursor-pointer accent-acento"
												/>
												{permiso.accion}
											</label>
										),
								)}
							</div>
						</fieldset>
					);
				})}
			</div>

			<div className="hidden overflow-x-auto rounded-lg border border-borde sm:block">
				<table className="w-full text-sm">
					<caption className="sr-only">
						Permisos del rol por recurso y acción
					</caption>
					<thead className="bg-elevada/60 text-xs text-tinta-suave">
						<tr>
							<th scope="col" className="px-4 py-2.5 text-left font-medium">
								<span className="flex items-center gap-3">
									<CasillaGrupo
										ids={permisos.map((p) => p.id)}
										seleccionados={seleccionados}
										onCambiar={onCambiar}
										etiqueta="Todos los permisos"
									/>
									Recurso
								</span>
							</th>
							{acciones.map((accion, i) => (
								<th
									key={accion}
									scope="col"
									className="px-3 py-2.5 text-center font-medium capitalize"
								>
									<span className="flex flex-col items-center gap-1.5">
										{accion}
										<CasillaGrupo
											ids={ids(filas.map((f) => f.celdas[i]))}
											seleccionados={seleccionados}
											onCambiar={onCambiar}
											etiqueta={`${accion} en todos los recursos`}
										/>
									</span>
								</th>
							))}
						</tr>
					</thead>
					<tbody className="divide-y divide-borde">
						{filas.map(({ recurso, celdas }) => (
							<tr
								key={recurso}
								className="transition-colors hover:bg-elevada/40"
							>
								<th scope="row" className="px-4 py-2.5 text-left font-medium">
									<span className="flex items-center gap-3 capitalize">
										<CasillaGrupo
											ids={ids(celdas)}
											seleccionados={seleccionados}
											onCambiar={onCambiar}
											etiqueta={`Todo ${recurso}`}
										/>
										{recurso}
									</span>
								</th>
								{celdas.map((permiso, i) => (
									<td key={acciones[i]} className="px-3 py-2.5 text-center">
										{permiso ? (
											<input
												type="checkbox"
												aria-label={`${permiso.recurso}:${permiso.accion}`}
												checked={seleccionados.has(permiso.id)}
												onChange={(e) =>
													onCambiar([permiso.id], e.target.checked)
												}
												className="size-4 cursor-pointer accent-acento"
											/>
										) : (
											<span className="text-tinta-tenue" aria-hidden>
												—
											</span>
										)}
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</>
	);
}
