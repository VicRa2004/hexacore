import { Link } from "@tanstack/react-router";
import { useAuthStore } from "@/core/auth/store";
import { useUsersQuery } from "../hooks/useUsersQuery";
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
	Users,
	ShieldCheck,
	Server,
	ArrowRight,
	ExternalLink,
	Layers,
	Cpu,
	Zap,
} from "lucide-react";

export function DashboardPage() {
	const user = useAuthStore((state) => state.user);
	const { data: usersData, isLoading: isLoadingUsers } = useUsersQuery({
		page: 1,
		limit: 1,
	});

	const roleVariant =
		user?.role === "ADMIN"
			? "purple"
			: user?.role === "MOD"
				? "warning"
				: "default";

	return (
		<div className="space-y-8">
			{/* Banner de Bienvenida */}
			<div className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-indigo-950/50 via-slate-900 to-slate-950 p-6 sm:p-8 shadow-2xl">
				<div className="relative z-10 max-w-2xl space-y-3">
					<div className="inline-flex items-center gap-2">
						<Badge variant={roleVariant} className="px-3 py-1 text-xs">
							Rol: {user?.role}
						</Badge>
						<Badge variant="success" className="px-3 py-1 text-xs">
							Sistema Operativo
						</Badge>
					</div>
					<h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
						¡Hola, {user?.name}!
					</h1>
					<p className="text-sm sm:text-base text-slate-300 leading-relaxed">
						Bienvenido a la consola de Hexacore. El frontend está estructurado
						de forma modular con React 19, TanStack Suite (Query, Router, Form)
						y Tailwind CSS v4, consumiendo el backend con Bun y Hono.
					</p>
					<div className="flex flex-wrap items-center gap-3 pt-2">
						<Link to="/users">
							<Button size="md" className="gap-2">
								<Users className="h-4 w-4" />
								Ver Usuarios
								<ArrowRight className="h-4 w-4" />
							</Button>
						</Link>
						<a
							href="/docs"
							target="_blank"
							rel="noreferrer"
							className="inline-flex items-center"
						>
							<Button variant="outline" size="md" className="gap-2">
								<Server className="h-4 w-4" />
								API Docs (Scalar)
								<ExternalLink className="h-3.5 w-3.5 text-slate-400" />
							</Button>
						</a>
					</div>
				</div>
			</div>

			{/* Tarjetas de Métricas */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium text-slate-400">
							Usuarios Registrados
						</CardTitle>
						<div className="p-2 rounded-lg bg-indigo-600/10 text-indigo-400">
							<Users className="h-4 w-4" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-white">
							{isLoadingUsers ? "..." : (usersData?.total ?? 0)}
						</div>
						<p className="text-xs text-slate-500 mt-1">
							Datos cacheados reactivamente vía TanStack Query
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium text-slate-400">
							Seguridad de Sesión
						</CardTitle>
						<div className="p-2 rounded-lg bg-emerald-600/10 text-emerald-400">
							<ShieldCheck className="h-4 w-4" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-emerald-400">
							JWT + Refresh
						</div>
						<p className="text-xs text-slate-500 mt-1">
							Rotación automática con interceptores de Axios
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between pb-2">
						<CardTitle className="text-sm font-medium text-slate-400">
							Rendimiento & Stack
						</CardTitle>
						<div className="p-2 rounded-lg bg-amber-600/10 text-amber-400">
							<Zap className="h-4 w-4" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-amber-400">Vite + Bun</div>
						<p className="text-xs text-slate-500 mt-1">
							Ultra rápido en desarrollo y unificado en producción
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Resumen de Arquitectura */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
				<Card>
					<CardHeader>
						<div className="flex items-center gap-2">
							<Layers className="h-5 w-5 text-indigo-400" />
							<CardTitle className="text-base">
								Arquitectura del Frontend
							</CardTitle>
						</div>
						<CardDescription>
							Estructura escalable dividida en capas limpias
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-2 text-xs text-slate-300">
						<div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
							<span className="font-mono text-indigo-300">src/core/</span>
							<span className="text-slate-400">
								API, Auth Store, Layouts, UI Primitives
							</span>
						</div>
						<div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
							<span className="font-mono text-indigo-300">
								src/modules/auth/
							</span>
							<span className="text-slate-400">
								Login, Registro, Schemas Zod, TanStack Form
							</span>
						</div>
						<div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
							<span className="font-mono text-indigo-300">
								src/modules/users/
							</span>
							<span className="text-slate-400">
								Hooks TanStack Query, Tablas, Perfil
							</span>
						</div>
						<div className="flex items-center justify-between py-1.5">
							<span className="font-mono text-indigo-300">src/routes/</span>
							<span className="text-slate-400">
								Enrutamiento seguro y tipado por archivos
							</span>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<div className="flex items-center gap-2">
							<Cpu className="h-5 w-5 text-indigo-400" />
							<CardTitle className="text-base">
								Integración con el Backend
							</CardTitle>
						</div>
						<CardDescription>
							Convivencia en monorepo de alto rendimiento
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-2 text-xs text-slate-300">
						<div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
							<span className="text-slate-200">Desarrollo:</span>
							<span className="text-slate-400">
								Vite (5173) + Proxy hacia Hono/Bun (3000)
							</span>
						</div>
						<div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
							<span className="text-slate-200">Producción:</span>
							<span className="text-slate-400">
								Hono Bun sirve dist/ + Fallback SPA
							</span>
						</div>
						<div className="flex items-center justify-between py-1.5 border-b border-slate-800/80">
							<span className="text-slate-200">CORS / Dominios:</span>
							<span className="text-emerald-400">
								0 problemas de CORS en producción
							</span>
						</div>
						<div className="flex items-center justify-between py-1.5">
							<span className="text-slate-200">Linter & Tipado:</span>
							<span className="text-indigo-400">
								Biome + TypeScript 7 Estricto
							</span>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
