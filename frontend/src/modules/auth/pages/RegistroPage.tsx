import { Link } from "@tanstack/react-router";
import { AuthLayout } from "@/core/components/layout/AuthLayout";
import { useAjustesPublicos } from "@/modules/ajustes/hooks/useAjustesQuery";
import { BotonesOAuth } from "../components/BotonesOAuth";
import { RegistroForm } from "../components/RegistroForm";

export function RegistroPage() {
	const { ajustes } = useAjustesPublicos();

	return (
		<AuthLayout
			title="Crear Cuenta"
			subtitle={
				ajustes.registroPublicoAbierto
					? `Únete a ${ajustes.nombreApp} completando tus datos`
					: `El registro público en ${ajustes.nombreApp} está desactivado`
			}
		>
			{ajustes.registroPublicoAbierto ? (
				<>
					<RegistroForm />
					<BotonesOAuth />
				</>
			) : (
				<div className="rounded-lg border border-borde bg-elevada p-4 text-center text-sm text-tinta-suave">
					El administrador ha cerrado el registro público. Solicita una cuenta o
					inicia sesión si ya tienes acceso.
				</div>
			)}
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
