import { createFileRoute } from "@tanstack/react-router";
import { RecuperarPasswordPage } from "@/modules/auth/pages/RecuperarPasswordPage";

export const Route = createFileRoute("/recuperar-password")({
	component: RecuperarPasswordPage,
});
