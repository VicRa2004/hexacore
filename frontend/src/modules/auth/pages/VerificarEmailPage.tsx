import { Link } from "@tanstack/react-router";
import { CheckCircle, MailCheck } from "lucide-react";
import { AuthLayout } from "@/core/components/layout/AuthLayout";
import { Button } from "@/core/components/ui/Button";
import { useVerificarEmailMutation } from "../hooks/useCuentaMutation";

/** Pide un clic en vez de verificar al cargar: los antivirus de correo abren los enlaces solos. */
export function VerificarEmailPage({ token }: { token: string }) {
	const verificar = useVerificarEmailMutation();

	return (
		<AuthLayout
			title="Verificar email"
			subtitle="Confirma tu dirección de correo"
		>
			{verificar.isSuccess ? (
				<div
					className="flex flex-col items-center gap-3 text-center"
					role="status"
				>
					<CheckCircle className="h-10 w-10 text-emerald-400" />
					<p className="text-sm text-slate-300">{verificar.data.mensaje}</p>
					<Link
						to="/dashboard"
						className="text-sm font-medium text-indigo-400 hover:underline"
					>
						Ir a la aplicación
					</Link>
				</div>
			) : (
				<Button
					className="w-full"
					size="lg"
					disabled={!token}
					onClick={() => verificar.mutate(token)}
					isLoading={verificar.isPending}
				>
					<MailCheck className="h-4 w-4" />
					Verificar mi email
				</Button>
			)}
		</AuthLayout>
	);
}
