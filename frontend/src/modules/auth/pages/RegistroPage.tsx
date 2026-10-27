import { Link } from "@tanstack/react-router";
import { AuthLayout } from "@/core/components/layout/AuthLayout";
import { RegistroForm } from "../components/RegistroForm";

export function RegistroPage() {
	return (
		<AuthLayout
			title="Crear Cuenta"
			subtitle="Únete a la plataforma completando tus datos"
		>
			<RegistroForm />
			<div className="mt-6 text-center text-xs text-tinta-tenue">
				¿Ya tienes una cuenta?{" "}
				<Link
					to="/login"
					className="font-medium text-indigo-400 hover:text-indigo-300 hover:underline"
				>
					Inicia sesión
				</Link>
			</div>
		</AuthLayout>
	);
}
