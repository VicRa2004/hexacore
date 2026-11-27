import { Link } from "@tanstack/react-router";
import { AuthLayout } from "@/core/components/layout/AuthLayout";
import { useAjustesPublicos } from "@/modules/ajustes/hooks/useAjustesQuery";
import { BotonesOAuth } from "../components/BotonesOAuth";
import { LoginForm } from "../components/LoginForm";

export function LoginPage() {
	const { ajustes } = useAjustesPublicos();

	return (
		<AuthLayout
			title="Iniciar Sesión"
			subtitle={`Ingresa tus credenciales para acceder a ${ajustes.nombreApp}`}
		>
			<LoginForm />
			<BotonesOAuth />
			<div className="mt-4 text-right text-xs">
				<Link
					to="/recuperar-password"
					className="font-medium text-acento-tinta hover:underline"
				>
					¿Olvidaste tu contraseña?
				</Link>
			</div>
			{ajustes.registroPublicoAbierto && (
				<div className="mt-6 text-center text-xs text-tinta-tenue">
					¿No tienes una cuenta?{" "}
					<Link
						to="/registro"
						className="font-medium text-acento-tinta hover:underline"
					>
						Regístrate aquí
					</Link>
				</div>
			)}
		</AuthLayout>
	);
}
