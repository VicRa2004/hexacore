import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useAuthStore } from "@/core/auth/store";
import { RegisterPage } from "@/modules/auth/pages/RegisterPage";

export const Route = createFileRoute("/register")({
	component: RegisterRouteComponent,
});

function RegisterRouteComponent() {
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

	if (isAuthenticated) {
		return <Navigate to="/dashboard" replace />;
	}

	return <RegisterPage />;
}
