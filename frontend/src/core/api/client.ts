import axios, {
	type AxiosResponse,
	type InternalAxiosRequestConfig,
	isAxiosError,
} from "axios";
import { useAuthStore } from "@/core/auth/store";
import type { AuthTokens } from "@/core/auth/types";
import type { ErrorResponse } from "./schema.gen";

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
	_retry?: boolean;
}

export const apiClient = axios.create({
	baseURL: "/api",
	headers: {
		"Content-Type": "application/json",
	},
});

// Una sola renovación en vuelo: el backend rota el refresh token, así que
// peticiones 401 simultáneas que lo reenvíen invalidarían la sesión.
let refreshPromise: Promise<string> | null = null;

function refreshAccessToken(): Promise<string> {
	refreshPromise ??= (async () => {
		// Llamada directa sin interceptores para evitar bucles. El refresh token
		// viaja solo en la cookie httpOnly (mismo origen vía el proxy /api).
		const { data } = await axios.post<AuthTokens>("/api/auth/refresh");

		useAuthStore.getState().setTokens({ accessToken: data.accessToken });
		return data.accessToken;
	})().finally(() => {
		refreshPromise = null;
	});
	return refreshPromise;
}

// Request Interceptor: Inyectar token de autenticación
apiClient.interceptors.request.use(
	(config: InternalAxiosRequestConfig) => {
		const token = useAuthStore.getState().accessToken;
		if (token && config.headers) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error: unknown) => {
		return Promise.reject(error);
	},
);

// Response Interceptor: Manejo de 401 y Refresh Token automático
apiClient.interceptors.response.use(
	(response: AxiosResponse) => response,
	async (error: unknown) => {
		if (!isAxiosError<ErrorResponse>(error) || !error.config) {
			return Promise.reject(error);
		}

		const originalRequest = error.config as CustomAxiosRequestConfig;

		if (error.response?.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true;
			const { isAuthenticated, logout } = useAuthStore.getState();

			// Sin sesión (p.ej. credenciales inválidas en el login) no hay qué renovar.
			if (!isAuthenticated) {
				logout();
				return Promise.reject(error);
			}

			try {
				const newAccessToken = await refreshAccessToken();

				if (originalRequest.headers) {
					originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
				}

				return apiClient(originalRequest);
			} catch (refreshError) {
				logout();
				return Promise.reject(refreshError);
			}
		}

		return Promise.reject(error);
	},
);

export function getErrorMessage(error: unknown): string {
	if (isAxiosError<ErrorResponse>(error)) {
		if (error.response?.data?.error) {
			return error.response.data.error;
		}
		if (error.message) {
			return error.message;
		}
	}
	if (error instanceof Error) {
		return error.message;
	}
	return "Ha ocurrido un error inesperado";
}
