import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { ErrorBoundary } from "@/core/components/ErrorBoundary";
import { queryClient } from "@/core/router";
import {
	DefaultErrorComponent,
	DefaultNotFoundComponent,
} from "@/core/router/RouteFallbacks";
import { routeTree } from "./routeTree.gen";
import "./index.css";

const router = createRouter({
	routeTree,
	context: {
		queryClient,
	},
	defaultPreload: "intent",
	defaultErrorComponent: DefaultErrorComponent,
	defaultNotFoundComponent: DefaultNotFoundComponent,
});

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

const rootElement = document.getElementById("root");
if (rootElement && !rootElement.innerHTML) {
	const root = createRoot(rootElement);
	root.render(
		<StrictMode>
			<ErrorBoundary>
				<QueryClientProvider client={queryClient}>
					<RouterProvider router={router} />
				</QueryClientProvider>
			</ErrorBoundary>
		</StrictMode>,
	);
}
