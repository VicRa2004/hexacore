import { createFileRoute } from "@tanstack/react-router";
import { UsersPage } from "@/modules/users/pages/UsersPage";

export const Route = createFileRoute("/_authenticated/users")({
	component: UsersPage,
});
