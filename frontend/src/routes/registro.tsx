import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useAuthStore } from "@/core/auth/store";
import { RegistroPage } from "@/modules/auth/pages/RegistroPage";

export const Route = createFileRoute("/registro")({
	component: RegistroRouteComponent,
});

function RegistroRouteComponent() {
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

	if (isAuthenticated) {
		return <Navigate to="/dashboard" replace />;
	}

	return <RegistroPage />;
}
