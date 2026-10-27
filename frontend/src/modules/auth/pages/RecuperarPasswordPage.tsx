import { Link } from "@tanstack/react-router";
import { AuthLayout } from "@/core/components/layout/AuthLayout";
import { RecuperarPasswordForm } from "../components/RecuperarPasswordForm";

export function RecuperarPasswordPage() {
	return (
		<AuthLayout
			title="Recuperar contraseña"
			subtitle="Te enviaremos un enlace para elegir una nueva"
		>
			<RecuperarPasswordForm />
			<div className="mt-6 text-center text-xs text-slate-400">
				<Link
					to="/login"
					className="font-medium text-indigo-400 hover:text-indigo-300 hover:underline"
				>
					Volver a iniciar sesión
				</Link>
			</div>
		</AuthLayout>
	);
}
