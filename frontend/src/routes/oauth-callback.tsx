import { createFileRoute } from "@tanstack/react-router";
import { OAuthCallbackPage } from "@/modules/auth/pages/OAuthCallbackPage";

export const Route = createFileRoute("/oauth-callback")({
	component: OAuthCallbackPage,
});
