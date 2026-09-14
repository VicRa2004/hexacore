import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useAuthStore } from "@/core/auth/store";
import { LoginPage } from "@/modules/auth/pages/LoginPage";

export const Route = createFileRoute("/login")({
	component: LoginRouteComponent,
});

function LoginRouteComponent() {
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

	if (isAuthenticated) {
		return <Navigate to="/dashboard" replace />;
	}

	return <LoginPage />;
}
