import { type ErrorComponentProps, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Compass, ShieldX } from "lucide-react";
import { useEffect } from "react";
import { AccesoDenegadoError } from "@/core/auth/permisos";
import { reportarError } from "@/core/monitoreo";
import { Button } from "@/core/components/ui/Button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/core/components/ui/Card";

function FallbackCard({
	title,
	description,
	children,
}: {
	title: string;
	description: string;
	children: React.ReactNode;
}) {
	return (
		<div className="flex min-h-screen items-center justify-center bg-fondo p-4">
			<Card className="w-full max-w-md text-center">
				<CardHeader>
					<CardTitle>{title}</CardTitle>
					<CardDescription>{description}</CardDescription>
				</CardHeader>
				<CardContent className="flex justify-center gap-2">
					{children}
				</CardContent>
			</Card>
		</div>
	);
}

/** Ruta sin permiso: se queda dentro del layout, sin reportarlo como error. */
function SinAcceso({ permiso }: { permiso: string }) {
	const router = useRouter();
	return (
		<div className="flex flex-col items-center gap-5 py-20 text-center">
			<div className="flex size-14 items-center justify-center rounded-2xl border border-peligro-borde bg-peligro-suave text-peligro-tinta">
				<ShieldX className="size-7" />
			</div>
			<div className="space-y-2">
				<h1 className="text-2xl font-semibold tracking-tight">Sin acceso</h1>
				<p className="max-w-sm text-sm text-tinta-tenue">
					Tu cuenta no tiene permiso para ver esta sección (
					<code className="font-mono text-xs">{permiso}</code>). Pídeselo a un
					administrador.
				</p>
			</div>
			<Button onClick={() => router.navigate({ to: "/dashboard" })}>
				Ir al inicio
			</Button>
		</div>
	);
}

/** Pantalla para errores no controlados de una ruta (en vez de dejarla en blanco). */
export function DefaultErrorComponent({ error, reset }: ErrorComponentProps) {
	const router = useRouter();
	const denegado = error instanceof AccesoDenegadoError;
	useEffect(() => {
		if (!denegado) reportarError(error);
	}, [error, denegado]);

	if (denegado) return <SinAcceso permiso={error.permiso} />;

	return (
		<FallbackCard
			title="Algo salió mal"
			description={
				import.meta.env.DEV && error instanceof Error
					? error.message
					: "Ha ocurrido un error inesperado."
			}
		>
			<Button
				onClick={() => {
					reset();
					router.invalidate();
				}}
			>
				Reintentar
			</Button>
			<Button variant="outline" onClick={() => router.navigate({ to: "/" })}>
				Ir al inicio
			</Button>
		</FallbackCard>
	);
}

export function DefaultNotFoundComponent() {
	const router = useRouter();

	return (
		<main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-fondo p-6 text-center">
			<div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-acento-borde bg-acento-suave text-acento-tinta">
				<Compass className="h-7 w-7" />
			</div>
			<div className="space-y-2">
				<p className="font-mono text-sm font-semibold text-acento-tinta">404</p>
				<h1 className="text-3xl font-extrabold tracking-tight text-tinta">
					Página no encontrada
				</h1>
				<p className="max-w-sm text-sm text-tinta-tenue">
					La dirección no existe o ha cambiado. Comprueba el enlace o vuelve a
					un sitio conocido.
				</p>
			</div>
			<div className="flex gap-2">
				<Button variant="outline" onClick={() => router.history.back()}>
					<ArrowLeft className="h-4 w-4" />
					Volver
				</Button>
				<Button onClick={() => router.navigate({ to: "/" })}>
					Ir al inicio
				</Button>
			</div>
		</main>
	);
}
