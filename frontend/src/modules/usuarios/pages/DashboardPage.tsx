import { Link, type LinkProps } from "@tanstack/react-router";
import {
	ArrowUpRight,
	BookOpen,
	History,
	KeyRound,
	type LucideIcon,
	ShieldCheck,
	Users,
} from "lucide-react";
import { varianteRol } from "@/core/auth/rol";
import { useAuthStore } from "@/core/auth/store";
import { Encabezado } from "@/core/components/layout/Encabezado";
import { Avatar } from "@/core/components/ui/Avatar";
import { Badge } from "@/core/components/ui/Badge";
import { Button } from "@/core/components/ui/Button";
import { Card, CardTitle } from "@/core/components/ui/Card";
import { Skeleton } from "@/core/components/ui/Skeleton";
import { ActividadReciente } from "@/modules/auditoria/components/ActividadReciente";
import { useAuditoriaQuery } from "@/modules/auditoria/hooks/useAuditoriaQuery";
import {
	usePermisosQuery,
	useRolesQuery,
} from "@/modules/roles/hooks/useRolesQuery";
import { useUsuariosQuery } from "../hooks/useUsuariosQuery";

interface Metrica {
	etiqueta: string;
	icono: LucideIcon;
	to: LinkProps["to"];
	valor?: number;
	isLoading: boolean;
	/** Sin permiso (403) u otro error: se muestra «—» en vez de romper el panel. */
	isError: boolean;
}

function TarjetaMetrica({
	etiqueta,
	icono: Icono,
	to,
	valor,
	isLoading,
	isError,
}: Metrica) {
	return (
		<Link
			to={to}
			className="group rounded-xl border border-borde bg-superficie p-5 shadow-sm transition-[border-color,box-shadow] hover:border-acento-borde hover:shadow focus-visible:outline-2 focus-visible:outline-acento"
		>
			<div className="flex items-center justify-between text-sm text-tinta-tenue">
				<span className="flex items-center gap-2">
					<span className="flex size-7 items-center justify-center rounded-md bg-acento-suave text-acento-tinta">
						<Icono className="size-4" />
					</span>
					{etiqueta}
				</span>
				<ArrowUpRight className="size-4 opacity-0 transition-opacity group-hover:opacity-100" />
			</div>
			<div className="mt-4 text-3xl font-semibold tracking-tight tabular-nums">
				{isLoading ? (
					<Skeleton className="h-9 w-16" />
				) : isError || valor === undefined ? (
					<span className="text-tinta-tenue" title="Sin acceso">
						—
					</span>
				) : (
					valor.toLocaleString("es")
				)}
			</div>
		</Link>
	);
}

function saludo() {
	const hora = new Date().getHours();
	if (hora < 12) return "Buenos días";
	if (hora < 20) return "Buenas tardes";
	return "Buenas noches";
}

export function DashboardPage() {
	const usuario = useAuthStore((state) => state.usuario);
	const usuarios = useUsuariosQuery({ pagina: 1, limite: 1 });
	const roles = useRolesQuery();
	const permisos = usePermisosQuery();
	const auditoria = useAuditoriaQuery({ pagina: 1, limite: 6 });

	const metricas: Metrica[] = [
		{
			etiqueta: "Usuarios",
			icono: Users,
			to: "/usuarios",
			valor: usuarios.data?.totalElementos,
			isLoading: usuarios.isLoading,
			isError: usuarios.isError,
		},
		{
			etiqueta: "Roles",
			icono: ShieldCheck,
			to: "/roles",
			valor: roles.data?.length,
			isLoading: roles.isLoading,
			isError: roles.isError,
		},
		{
			etiqueta: "Permisos",
			icono: KeyRound,
			to: "/roles",
			valor: permisos.data?.length,
			isLoading: permisos.isLoading,
			isError: permisos.isError,
		},
		{
			etiqueta: "Eventos auditados",
			icono: History,
			to: "/auditoria",
			valor: auditoria.data?.totalElementos,
			isLoading: auditoria.isLoading,
			isError: auditoria.isError,
		},
	];

	return (
		<div className="space-y-8">
			<Encabezado
				titulo={`${saludo()}, ${usuario?.nombre.split(" ")[0] ?? ""}`}
				descripcion="Resumen de tu espacio de trabajo."
				acciones={
					<Button
						variant="outline"
						onClick={() => window.open("/docs", "_blank", "noopener")}
					>
						<BookOpen />
						API
					</Button>
				}
			/>

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{metricas.map((m) => (
					<TarjetaMetrica key={m.etiqueta} {...m} />
				))}
			</div>

			<div className="grid gap-6 lg:grid-cols-3">
				<div className="lg:col-span-2">
					<ActividadReciente />
				</div>
				{usuario && (
					<Card className="space-y-5">
						<CardTitle>Tu cuenta</CardTitle>
						<div className="flex items-center gap-3">
							<Avatar nombre={usuario.nombre} src={usuario.avatarUrl} />
							<div className="min-w-0">
								<p className="truncate text-sm font-medium">{usuario.nombre}</p>
								<p className="truncate text-xs text-tinta-tenue">
									{usuario.email}
								</p>
							</div>
						</div>
						<div className="flex flex-wrap gap-1.5">
							<Badge variant={varianteRol(usuario.roles)}>
								{usuario.roles.join(", ")}
							</Badge>
							{usuario.emailVerificado === false ? (
								<Badge variant="warning">Email sin verificar</Badge>
							) : (
								<Badge variant="success">Email verificado</Badge>
							)}
						</div>
						<Link
							to="/perfil"
							className="inline-flex items-center gap-1 text-sm font-medium text-acento-tinta hover:underline"
						>
							Gestionar perfil y sesiones
							<ArrowUpRight className="size-3.5" />
						</Link>
					</Card>
				)}
			</div>
		</div>
	);
}
