import { Link } from "@tanstack/react-router";
import { AuthLayout } from "@/core/components/layout/AuthLayout";
import { LoginForm } from "../components/LoginForm";

export function LoginPage() {
	return (
		<AuthLayout
			title="Iniciar Sesión"
			subtitle="Ingresa tus credenciales para acceder a Hexacore"
		>
			<LoginForm />
			<div className="mt-4 text-right text-xs">
				<Link
					to="/recuperar-password"
					className="font-medium text-indigo-400 hover:text-indigo-300 hover:underline"
				>
					¿Olvidaste tu contraseña?
				</Link>
			</div>
			<div className="mt-6 text-center text-xs text-tinta-tenue">
				¿No tienes una cuenta?{" "}
				<Link
					to="/registro"
					className="font-medium text-indigo-400 hover:text-indigo-300 hover:underline"
				>
					Regístrate aquí
				</Link>
			</div>
		</AuthLayout>
	);
}
