import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { VerificarEmailPage } from "@/modules/auth/pages/VerificarEmailPage";

export const Route = createFileRoute("/verificar-email")({
	validateSearch: z.object({ token: z.string().catch("") }),
	component: VerificarEmailRoute,
});

function VerificarEmailRoute() {
	const { token } = Route.useSearch();
	return <VerificarEmailPage token={token} />;
}
