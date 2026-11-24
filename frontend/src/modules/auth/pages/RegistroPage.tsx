import { Link } from "@tanstack/react-router";
import { AuthLayout } from "@/core/components/layout/AuthLayout";
import { BotonesOAuth } from "../components/BotonesOAuth";
import { RegistroForm } from "../components/RegistroForm";

export function RegistroPage() {
	return (
		<AuthLayout
			title="Crear Cuenta"
			subtitle="Únete a la plataforma completando tus datos"
		>
			<RegistroForm />
			<BotonesOAuth />
			<div className="mt-6 text-center text-xs text-tinta-tenue">
				¿Ya tienes una cuenta?{" "}
				<Link
					to="/login"
					className="font-medium text-acento-tinta hover:underline"
				>
					Inicia sesión
				</Link>
			</div>
		</AuthLayout>
	);
}
