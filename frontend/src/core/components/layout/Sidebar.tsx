import { Link, type LinkProps } from "@tanstack/react-router";
import {
	Hexagon,
	History,
	LayoutDashboard,
	type LucideIcon,
	Palette,
	PanelLeftClose,
	PanelLeftOpen,
	ShieldCheck,
	Users,
} from "lucide-react";
import { type Permiso, usePermisos } from "@/core/auth/permisos";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { cn } from "@/core/utils/cn";

interface Enlace {
	to: LinkProps["to"];
	etiqueta: string;
	icono: LucideIcon;
	/** Sin él, visible para cualquiera con sesión. */
	permiso?: Permiso;
}

// Para quitar un módulo, quita también su enlace (ver AGENTS.md).
const SECCIONES: { titulo: string; enlaces: Enlace[] }[] = [
	{
		titulo: "General",
		enlaces: [
			{ to: "/dashboard", etiqueta: "Dashboard", icono: LayoutDashboard },
		],
	},
	{
		titulo: "Administración",
		enlaces: [
			{
				to: "/usuarios",
				etiqueta: "Usuarios",
				icono: Users,
				permiso: "usuarios:leer",
			},
			{
				to: "/roles",
				etiqueta: "Roles",
				icono: ShieldCheck,
				permiso: "roles:leer",
			},
			{
				to: "/auditoria",
				etiqueta: "Auditoría",
				icono: History,
				permiso: "auditoria:leer",
			},
		],
	},
	...(import.meta.env.DEV
		? [
				{
					titulo: "Desarrollo",
					enlaces: [
						{
							to: "/ui" as const,
							etiqueta: "Catálogo UI",
							icono: Palette,
						},
					],
				},
			]
		: []),
];

interface SidebarProps {
	plegado: boolean;
	/** Sin él no se muestra el botón de plegar (cajón de móvil). */
	onPlegar?: () => void;
	onNavegar?: () => void;
}

function EnlaceNav({
	enlace,
	plegado,
	onNavegar,
}: {
	enlace: Enlace;
	plegado: boolean;
	onNavegar?: () => void;
}) {
	const Icono = enlace.icono;
	return (
		<Tooltip texto={enlace.etiqueta} activo={plegado}>
			<Link
				to={enlace.to}
				onClick={onNavegar}
				aria-label={plegado ? enlace.etiqueta : undefined}
				className={cn(
					"flex h-9 items-center gap-3 rounded-md px-2.5 text-sm font-medium text-tinta-suave transition-colors hover:bg-elevada hover:text-tinta focus-visible:outline-2 focus-visible:outline-acento [&.active]:bg-acento-suave [&.active]:text-acento-tinta",
					plegado ? "w-9 justify-center px-0" : "w-full",
				)}
			>
				<Icono className="size-4 shrink-0" />
				{!plegado && enlace.etiqueta}
			</Link>
		</Tooltip>
	);
}

export function Sidebar({ plegado, onPlegar, onNavegar }: SidebarProps) {
	const { puede } = usePermisos();
	const secciones = SECCIONES.map((s) => ({
		...s,
		enlaces: s.enlaces.filter((e) => !e.permiso || puede(e.permiso)),
	})).filter((s) => s.enlaces.length > 0);

	return (
		<div className="flex h-full flex-col gap-6 p-3">
			<Link
				to="/dashboard"
				onClick={onNavegar}
				className={cn(
					"flex h-9 items-center gap-2.5 rounded-md px-1",
					plegado && "justify-center px-0",
				)}
			>
				<span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-acento text-sobre-acento shadow-sm">
					<Hexagon className="size-4.5 stroke-[2.4]" />
				</span>
				{!plegado && (
					<span className="text-base font-semibold tracking-tight">
						Hexacore
					</span>
				)}
			</Link>

			<nav
				aria-label="Principal"
				className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto"
			>
				{secciones.map((seccion) => (
					<div key={seccion.titulo} className="space-y-1">
						{plegado ? (
							<hr className="mx-2 mb-2 border-borde" />
						) : (
							<p className="px-2.5 pb-1 text-xs font-medium text-tinta-tenue">
								{seccion.titulo}
							</p>
						)}
						{seccion.enlaces.map((enlace) => (
							<EnlaceNav
								key={enlace.etiqueta}
								enlace={enlace}
								plegado={plegado}
								onNavegar={onNavegar}
							/>
						))}
					</div>
				))}
			</nav>

			<div className="space-y-1">
				{onPlegar && (
					<Tooltip texto="Desplegar menú" activo={plegado}>
						<button
							type="button"
							onClick={onPlegar}
							aria-label={plegado ? "Desplegar menú" : "Plegar menú"}
							aria-expanded={!plegado}
							className={cn(
								"flex h-9 cursor-pointer items-center gap-3 rounded-md px-2.5 text-sm text-tinta-tenue transition-colors hover:bg-elevada hover:text-tinta focus-visible:outline-2 focus-visible:outline-acento",
								plegado ? "w-9 justify-center px-0" : "w-full",
							)}
						>
							{plegado ? (
								<PanelLeftOpen className="size-4" />
							) : (
								<>
									<PanelLeftClose className="size-4" />
									Plegar menú
								</>
							)}
						</button>
					</Tooltip>
				)}
			</div>
		</div>
	);
}
