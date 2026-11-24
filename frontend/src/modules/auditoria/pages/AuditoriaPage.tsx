import { useNavigate, useSearch } from "@tanstack/react-router";
import { Search } from "lucide-react";
import type { RegistroAuditoria } from "@/core/api/schema.gen";
import { Encabezado } from "@/core/components/layout/Encabezado";
import { Input } from "@/core/components/ui/Input";
import { type Columna, Tabla } from "@/core/components/ui/Table";
import { useBusquedaDebounced } from "@/core/hooks/useBusquedaDebounced";
import { conFiltro, normalizarPagina } from "@/core/router/searchParams";
import { fechaCompleta, fechaRelativa } from "@/core/utils/fecha";
import { EventoBadge } from "../components/EventoBadge";
import { useAuditoriaQuery } from "../hooks/useAuditoriaQuery";

const COLUMNAS: Columna<RegistroAuditoria>[] = [
	{
		cabecera: "Cuándo",
		className: "whitespace-nowrap",
		celda: (r) => (
			<time dateTime={r.ocurridoEn} title={fechaCompleta(r.ocurridoEn)}>
				{fechaRelativa(r.ocurridoEn)}
			</time>
		),
	},
	{ cabecera: "Evento", celda: (r) => <EventoBadge evento={r.evento} /> },
	{
		cabecera: "Usuario",
		celda: (r) =>
			r.usuarioId === null ? (
				<span className="text-tinta-tenue">Sistema</span>
			) : (
				`#${r.usuarioId}`
			),
	},
	{
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

	const { data, isLoading, error } = useAuditoriaQuery({
		pagina: search.pagina ?? 1,
		limite: 15,
		evento: search.evento,
	});

	return (
		<div className="space-y-6">
			<Encabezado
				titulo="Auditoría"
				descripcion="Quién hizo qué y cuándo: cada evento del sistema con su usuario y petición."
				acciones={
					<div className="relative w-full sm:w-64">
						<Input
							type="search"
							aria-label="Filtrar por evento"
							placeholder="Filtrar por evento…"
							value={evento}
							onChange={(e) => setEvento(e.target.value)}
							className="pl-9"
						/>
						<Search className="pointer-events-none absolute top-2.5 left-3 size-4 text-tinta-tenue" />
					</div>
				}
			/>
			<Tabla
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
				isLoading={isLoading}
				error={error}
			/>
		</div>
	);
}
