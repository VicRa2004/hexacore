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
		<div className="overflow-x-auto rounded-lg border border-borde">
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
						<tr key={recurso} className="transition-colors hover:bg-elevada/40">
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
	);
}
