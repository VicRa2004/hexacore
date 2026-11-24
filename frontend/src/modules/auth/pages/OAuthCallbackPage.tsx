import { AuthLayout } from "@/core/components/layout/AuthLayout";
import { OAuthCallback } from "../components/OAuthCallback";

export function OAuthCallbackPage() {
	return (
		<AuthLayout title="Iniciar Sesión" subtitle="Volviendo de tu proveedor">
			<OAuthCallback />
		</AuthLayout>
	);
}
