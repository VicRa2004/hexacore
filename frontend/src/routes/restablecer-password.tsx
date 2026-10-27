import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { RestablecerPasswordPage } from "@/modules/auth/pages/RestablecerPasswordPage";

export const Route = createFileRoute("/restablecer-password")({
	validateSearch: z.object({ token: z.string().catch("") }),
	component: RestablecerPasswordRoute,
});

function RestablecerPasswordRoute() {
	const { token } = Route.useSearch();
	return <RestablecerPasswordPage token={token} />;
}
