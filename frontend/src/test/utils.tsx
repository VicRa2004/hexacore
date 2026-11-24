import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type RenderOptions, render } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";

export function crearQueryClientDeTest(): QueryClient {
	return new QueryClient({
		defaultOptions: {
			queries: { retry: false },
			mutations: { retry: false },
		},
	});
}

export function crearWrapperQuery(queryClient: QueryClient) {
	return function WrapperQuery({ children }: { children: ReactNode }) {
		return (
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		);
	};
}

export function renderConQueryClient(
	ui: ReactElement,
	opciones?: Omit<RenderOptions, "wrapper"> & { queryClient?: QueryClient },
) {
	const queryClient = opciones?.queryClient ?? crearQueryClientDeTest();
	const wrapper = crearWrapperQuery(queryClient);
	const resultado = render(ui, { ...opciones, wrapper });
	return { ...resultado, queryClient };
}
