import { Link } from "@tanstack/react-router";
import { AuthLayout } from "@/core/components/layout/AuthLayout";
import { RestablecerPasswordForm } from "../components/RestablecerPasswordForm";

export function RestablecerPasswordPage({ token }: { token: string }) {
	return (
		<AuthLayout
			title="Nueva contraseña"
			subtitle="Elige una contraseña nueva para tu cuenta"
		>
			{token ? (
				<RestablecerPasswordForm token={token} />
			) : (
				<p className="text-center text-sm text-peligro-tinta">
					El enlace no es válido.{" "}
					<Link to="/recuperar-password" className="underline">
						Pide uno nuevo
					</Link>
					.
				</p>
			)}
		</AuthLayout>
	);
}
