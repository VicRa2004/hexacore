import { type ErrorComponentProps, useRouter } from "@tanstack/react-router";
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
		<div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
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

/** Pantalla para errores no controlados de una ruta (en vez de dejarla en blanco). */
export function DefaultErrorComponent({ error, reset }: ErrorComponentProps) {
	const router = useRouter();

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
		<FallbackCard
			title="Página no encontrada"
			description="La página que buscas no existe."
		>
			<Button onClick={() => router.navigate({ to: "/" })}>Ir al inicio</Button>
		</FallbackCard>
	);
}
