import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { Toaster } from "sonner";
import type { RouterContext } from "@/core/router";
import { useTema } from "@/core/tema";

export const Route = createRootRouteWithContext<RouterContext>()({
	component: RootComponent,
});

function RootComponent() {
	const { efectivo } = useTema();
	return (
		<>
			<Outlet />
			<Toaster
				richColors
				position="top-right"
				theme={efectivo === "oscuro" ? "dark" : "light"}
			/>
		</>
	);
}
