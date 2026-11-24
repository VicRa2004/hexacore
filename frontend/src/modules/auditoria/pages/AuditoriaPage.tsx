import { useNavigate, useSearch } from "@tanstack/react-router";
import { Download } from "lucide-react";
import type { RegistroAuditoria } from "@/core/api/schema.gen";
import { Encabezado } from "@/core/components/layout/Encabezado";
import { Button } from "@/core/components/ui/Button";
import { type Columna, Tabla } from "@/core/components/ui/Table";
import { useBusquedaDebounced } from "@/core/hooks/useBusquedaDebounced";
import {
	conFiltro,
	conOrden,
	normalizarPagina,
} from "@/core/router/searchParams";
import { fechaCompleta, fechaRelativa } from "@/core/utils/fecha";
import type { CampoOrdenAuditoria } from "../api/auditoriaApi";
import { AuditoriaFiltrosBar } from "../components/AuditoriaFiltrosBar";
import { EventoBadge } from "../components/EventoBadge";
import {
	useAuditoriaQuery,
	useExportarAuditoriaMutation,
} from "../hooks/useAuditoriaQuery";

const COLUMNAS: Columna<RegistroAuditoria>[] = [
	{
		id: "ocurridoEn",
		cabecera: "Cuándo",
		ordenable: true,
		className: "whitespace-nowrap",
		celda: (r) => (
			<time dateTime={r.ocurridoEn} title={fechaCompleta(r.ocurridoEn)}>
				{fechaRelativa(r.ocurridoEn)}
			</time>
		),
	},
	{
		id: "evento",
		cabecera: "Evento",
		ordenable: true,
		celda: (r) => <EventoBadge evento={r.evento} />,
	},
	{
		id: "usuarioId",
		cabecera: "Usuario",
		ordenable: true,
		celda: (r) =>
			r.usuarioId === null ? (
				<span className="text-tinta-tenue">Sistema</span>
			) : (
				`#${r.usuarioId}`
			),
	},
	{
		id: "datos",
		cabecera: "Datos",
		className: "w-full",
		celda: (r) =>
			r.datos === undefined ? null : (
				<details className="group">
					<summary className="cursor-pointer text-xs text-tinta-tenue select-none hover:text-tinta">
						Ver datos
					</summary>
					<pre className="mt-2 max-w-xl overflow-x-auto rounded-md bg-elevada p-3 font-mono text-xs text-tinta-suave">
						{JSON.stringify(r.datos, null, 2)}
					</pre>
				</details>
			),
	},
	{
		id: "requestId",
		cabecera: "Petición",
		celda: (r) => (
			<span className="font-mono text-xs text-tinta-tenue">
				{r.requestId?.slice(0, 8) ?? "—"}
			</span>
		),
	},
];

export function AuditoriaPage() {
	const search = useSearch({ from: "/_authenticated/auditoria" });
	const navigate = useNavigate({ from: "/auditoria" });
	const [evento, setEvento] = useBusquedaDebounced(search.evento, (valor) =>
		navigate({
			search: (prev) => conFiltro(prev, { evento: valor }),
			replace: true,
		}),
	);

	const filtrosActivos = {
		evento: search.evento,
		usuarioId: search.usuarioId,
		desde: search.desde,
		hasta: search.hasta,
		orden: search.orden,
		direccion: search.orden ? search.direccion : undefined,
	};

	const { data, isLoading, error } = useAuditoriaQuery({
		pagina: search.pagina ?? 1,
		limite: 15,
		...filtrosActivos,
	});
	const exportar = useExportarAuditoriaMutation();

	const hayFiltros = Boolean(
		search.evento || search.usuarioId || search.desde || search.hasta,
	);

	return (
		<div className="space-y-6">
			<Encabezado
				titulo="Auditoría"
				descripcion="Quién hizo qué y cuándo: cada evento del sistema con su usuario y petición."
				acciones={
					<Button
						variant="outline"
						isLoading={exportar.isPending}
						onClick={() => exportar.mutate(filtrosActivos)}
					>
						<Download />
						Exportar CSV
					</Button>
				}
			/>

			<AuditoriaFiltrosBar
				evento={evento}
				onEventoChange={setEvento}
				usuarioId={search.usuarioId}
				onUsuarioIdChange={(usuarioId) =>
					navigate({
						search: (prev) => conFiltro(prev, { usuarioId }),
						replace: true,
					})
				}
				desde={search.desde}
				onDesdeChange={(desde) =>
					navigate({
						search: (prev) => conFiltro(prev, { desde }),
						replace: true,
					})
				}
				hasta={search.hasta}
				onHastaChange={(hasta) =>
					navigate({
						search: (prev) => conFiltro(prev, { hasta }),
						replace: true,
					})
				}
				hayFiltrosActivos={hayFiltros}
				onLimpiar={() => {
					setEvento("");
					navigate({
						search: (prev) =>
							conFiltro(prev, {
								evento: undefined,
								usuarioId: undefined,
								desde: undefined,
								hasta: undefined,
							}),
						replace: true,
					});
				}}
			/>

			<Tabla
				tablaId="auditoria"
				etiqueta="Registro de auditoría"
				columnas={COLUMNAS}
				datos={data}
				clave={(r) => r.id}
				onCambioPagina={(nuevaPagina) =>
					navigate({
						search: (prev) => ({
							...prev,
							pagina: normalizarPagina(nuevaPagina),
						}),
					})
				}
				orden={{ orden: search.orden, direccion: search.direccion }}
				onCambioOrden={(nuevoOrden) =>
					navigate({
						search: (prev) =>
							conOrden(prev, {
								orden: nuevoOrden.orden as CampoOrdenAuditoria | undefined,
								direccion: nuevoOrden.direccion,
							}),
					})
				}
				isLoading={isLoading}
				error={error}
			/>
		</div>
	);
}
