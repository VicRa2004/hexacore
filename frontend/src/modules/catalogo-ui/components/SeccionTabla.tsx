import { CheckCheck, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/core/components/ui/Badge";
import { Button } from "@/core/components/ui/Button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/core/components/ui/Card";
import {
	type Columna,
	type OrdenTabla,
	type Pagina,
	Tabla,
} from "@/core/components/ui/Table";
import { cn } from "@/core/utils/cn";

interface ServicioDemo {
	id: string;
	nombre: string;
	entorno: "produccion" | "staging";
	estado: "activo" | "degradado";
	latenciaMs: number;
	responsable: string;
	protegido?: boolean;
}

const REGISTROS_DEMO: ServicioDemo[] = [
	{
		id: "srv-1",
		nombre: "Auth Gateway",
		entorno: "produccion",
		estado: "activo",
		latenciaMs: 24,
		responsable: "Ana López",
		protegido: true,
	},
	{
		id: "srv-2",
		nombre: "Motor de Auditoría",
		entorno: "produccion",
		estado: "activo",
		latenciaMs: 41,
		responsable: "Carlos Ruiz",
	},
	{
		id: "srv-3",
		nombre: "Cola de Correos",
		entorno: "staging",
		estado: "degradado",
		latenciaMs: 185,
		responsable: "Elena Martín",
	},
	{
		id: "srv-4",
		nombre: "Facturación PDF",
		entorno: "produccion",
		estado: "activo",
		latenciaMs: 68,
		responsable: "Diego Pérez",
	},
	{
		id: "srv-5",
		nombre: "Indexador Búsqueda",
		entorno: "staging",
		estado: "activo",
		latenciaMs: 53,
		responsable: "Laura Gómez",
	},
	{
		id: "srv-6",
		nombre: "Webhooks Salientes",
		entorno: "produccion",
		estado: "degradado",
		latenciaMs: 210,
		responsable: "Marcos Díaz",
	},
];

type EstadoTablaDemo = "datos" | "cargando" | "vacio" | "error";

const POR_PAGINA = 4;

/** Demuestra la Tabla evolucionada (#141): orden, visibilidad de columnas, selección y estados. */
export function SeccionTabla() {
	const [estado, setEstado] = useState<EstadoTablaDemo>("datos");
	const [pagina, setPagina] = useState(1);
	const [orden, setOrden] = useState<OrdenTabla>({
		orden: "nombre",
		direccion: "asc",
	});

	const paginaDatos = useMemo((): Pagina<ServicioDemo> | undefined => {
		if (estado === "vacio") {
			return { datos: [], pagina: 1, totalElementos: 0, totalPaginas: 0 };
		}
		if (estado !== "datos") return undefined;

		const ordenados = [...REGISTROS_DEMO].sort((a, b) => {
			const campo = orden.orden;
			if (!campo) return 0;
			const factor = orden.direccion === "desc" ? -1 : 1;
			if (campo === "latenciaMs") {
				return (a.latenciaMs - b.latenciaMs) * factor;
			}
			const valorA = String(a[campo as keyof ServicioDemo] ?? "");
			const valorB = String(b[campo as keyof ServicioDemo] ?? "");
			return valorA.localeCompare(valorB, "es") * factor;
		});

		const totalPaginas = Math.ceil(ordenados.length / POR_PAGINA);
		const paginaSegura = Math.min(pagina, totalPaginas);
		const inicio = (paginaSegura - 1) * POR_PAGINA;

		return {
			datos: ordenados.slice(inicio, inicio + POR_PAGINA),
			pagina: paginaSegura,
			totalElementos: ordenados.length,
			totalPaginas,
		};
	}, [estado, orden, pagina]);

	const columnas: Columna<ServicioDemo>[] = [
		{
			id: "nombre",
			cabecera: "Servicio",
			ordenable: true,
			celda: (fila) => (
				<div>
					<p className="font-medium text-tinta">{fila.nombre}</p>
					{fila.protegido && (
						<p className="text-xs text-tinta-tenue">
							Protegido (no seleccionable)
						</p>
					)}
				</div>
			),
		},
		{
			id: "entorno",
			cabecera: "Entorno",
			ordenable: true,
			celda: (fila) => (
				<Badge variant={fila.entorno === "produccion" ? "accent" : "default"}>
					{fila.entorno}
				</Badge>
			),
		},
		{
			id: "estado",
			cabecera: "Estado",
			ordenable: true,
			celda: (fila) => (
				<Badge variant={fila.estado === "activo" ? "success" : "warning"}>
					{fila.estado}
				</Badge>
			),
		},
		{
			id: "latenciaMs",
			cabecera: "Latencia",
			ordenable: true,
			className: "font-mono text-xs",
			celda: (fila) => `${fila.latenciaMs} ms`,
		},
		{
			id: "responsable",
			cabecera: "Responsable",
			ocultaPorDefecto: true,
			celda: (fila) => fila.responsable,
		},
		{
			id: "acciones",
			cabecera: "Acciones",
			ocultable: false,
			className: "text-right",
			celda: (fila) => (
				<Button
					variant="ghost"
					size="sm"
					onClick={() => toast.info(`Inspeccionando ${fila.nombre}`)}
				>
					Ver
				</Button>
			),
		},
	];

	return (
		<section id="tabla" className="scroll-mt-28 space-y-6">
			<div className="flex flex-wrap items-end justify-between gap-4">
				<div>
					<h2 className="text-xl font-semibold tracking-tight text-tinta">
						Tabla (#141)
					</h2>
					<p className="text-sm text-tinta-tenue">
						Ordenamiento en cabecera, selector de columnas persistente y
						selección en bloque.
					</p>
				</div>
				<div className="flex flex-wrap gap-1 rounded-lg border border-borde bg-elevada p-1">
					{(["datos", "cargando", "vacio", "error"] as EstadoTablaDemo[]).map(
						(item) => (
							<button
								key={item}
								type="button"
								onClick={() => setEstado(item)}
								className={cn(
									"cursor-pointer rounded-md px-3 py-1 text-xs font-medium capitalize transition-colors",
									estado === item
										? "bg-superficie text-tinta shadow-sm"
										: "text-tinta-tenue hover:text-tinta",
								)}
							>
								{item}
							</button>
						),
					)}
				</div>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Servicios de ejemplo</CardTitle>
					<CardDescription>
						La columna «Responsable» inicia oculta por defecto; la primera fila
						bloquea selección con{" "}
						<code className="font-mono text-xs">puedeSeleccionar</code>.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Tabla
						tablaId="catalogo-ui-demo"
						etiqueta="Catálogo de tabla"
						columnas={columnas}
						datos={paginaDatos}
						clave={(fila) => fila.id}
						orden={orden}
						onCambioOrden={(nuevoOrden) => {
							setOrden(nuevoOrden);
							setPagina(1);
						}}
						onCambioPagina={setPagina}
						isLoading={estado === "cargando"}
						error={
							estado === "error"
								? new Error("Error simulado al consultar el listado")
								: undefined
						}
						seleccionable
						puedeSeleccionar={(fila) => !fila.protegido}
						accionesEnBloque={(seleccionados, limpiar) => (
							<>
								<Button
									size="sm"
									variant="outline"
									onClick={() => {
										toast.success(
											`${seleccionados.length} servicio(s) verificados`,
										);
										limpiar();
									}}
								>
									<CheckCheck />
									Verificar
								</Button>
								<Button
									size="sm"
									variant="danger"
									onClick={() => {
										toast.info(
											`Acción en bloque sobre ${seleccionados.map((s) => s.nombre).join(", ")}`,
										);
										limpiar();
									}}
								>
									<Trash2 />
									Desactivar
								</Button>
							</>
						)}
					/>
				</CardContent>
			</Card>
		</section>
	);
}
