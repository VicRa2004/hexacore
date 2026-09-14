import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useAuthStore } from "@/core/auth/store";

export const Route = createFileRoute("/")({
	component: IndexComponent,
});

function IndexComponent() {
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

	if (isAuthenticated) {
		return <Navigate to="/dashboard" replace />;
	}

	return <Navigate to="/login" replace />;
}
