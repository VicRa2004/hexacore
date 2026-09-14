import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 1000 * 60 * 5, // 5 minutos de cache
			retry: (failureCount, error) => {
				// No reintentar en errores 401 o 403
				if (
					typeof error === "object" &&
					error !== null &&
					"response" in error
				) {
					const status = (error as { response?: { status?: number } }).response
						?.status;
					if (status === 401 || status === 403 || status === 404) {
						return false;
					}
				}
				return failureCount < 2;
			},
			refetchOnWindowFocus: false,
		},
	},
});

export interface RouterContext {
	queryClient: QueryClient;
}
