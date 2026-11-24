import axios, {
	AxiosError,
	type AxiosAdapter,
	type AxiosResponse,
	type InternalAxiosRequestConfig,
} from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { clearMock, reportarErrorApiMock, inyectarCabecerasTrazaMock } =
	vi.hoisted(() => ({
		clearMock: vi.fn(),
		reportarErrorApiMock: vi.fn(),
		inyectarCabecerasTrazaMock: vi.fn(),
	}));

vi.mock("@/core/router", () => ({
	queryClient: { clear: clearMock },
}));

vi.mock("@/core/monitoreo", () => ({
	reportarErrorApi: reportarErrorApiMock,
}));

vi.mock("@/core/telemetria", () => ({
	inyectarCabecerasTraza: inyectarCabecerasTrazaMock,
}));

import { useAuthStore } from "@/core/auth/store";
import { apiClient, getErrorMessage } from "./client";

const usuarioDemo = {
	id: 1,
	nombre: "Ana",
	email: "ana@hexacore.io",
	isActivo: true,
	emailVerificado: true,
	avatarUrl: null,
	roles: ["ADMIN"],
};

function crearRespuesta(
	config: InternalAxiosRequestConfig,
	data: unknown,
	status = 200,
): AxiosResponse {
	return {
		data,
		status,
		statusText: "OK",
		headers: {},
		config,
	};
}

function crearError401(config: InternalAxiosRequestConfig): AxiosError {
	return new AxiosError(
		"Unauthorized",
		"ERR_BAD_REQUEST",
		config,
		null,
		crearRespuesta(config, { error: "Token expirado" }, 401),
	);
}

describe("apiClient (interceptores y refresh token)", () => {
	const adaptadorOriginal = apiClient.defaults.adapter;

	beforeEach(() => {
		clearMock.mockClear();
		reportarErrorApiMock.mockClear();
		inyectarCabecerasTrazaMock.mockClear();
		useAuthStore.getState().logout();
	});

	afterEach(() => {
		apiClient.defaults.adapter = adaptadorOriginal;
		vi.restoreAllMocks();
	});

	it("debería inyectar la cabecera Authorization cuando hay sesión activa", async () => {
		useAuthStore.getState().login({
			accessToken: "token-inicial",
			usuario: usuarioDemo,
		});
		const cabecerasCapturadas: string[] = [];

		const adapter: AxiosAdapter = async (config) => {
			cabecerasCapturadas.push(String(config.headers.Authorization ?? ""));
			return crearRespuesta(config, { ok: true });
		};
		apiClient.defaults.adapter = adapter;

		const res = await apiClient.get<{ ok: boolean }>("/protegido");

		expect(res.data.ok).toBe(true);
		expect(cabecerasCapturadas).toEqual(["Bearer token-inicial"]);
	});

	it("debería ejecutar una sola renovación en vuelo ante múltiples 401 simultáneos", async () => {
		useAuthStore.getState().login({
			accessToken: "token-expirado",
			usuario: usuarioDemo,
		});

		let resolverRefresh!: (value: { data: { accessToken: string } }) => void;
		const refreshPendiente = new Promise<{ data: { accessToken: string } }>(
			(resolve) => {
				resolverRefresh = resolve;
			},
		);
		const postSpy = vi
			.spyOn(axios, "post")
			.mockReturnValueOnce(refreshPendiente as never);

		const adapter: AxiosAdapter = async (config) => {
			if (config.headers.Authorization === "Bearer token-renovado") {
				return crearRespuesta(config, { url: config.url, renovado: true });
			}
			throw crearError401(config);
		};
		apiClient.defaults.adapter = adapter;

		const p1 = apiClient.get<{ url: string }>("/recurso-1");
		const p2 = apiClient.get<{ url: string }>("/recurso-2");
		const p3 = apiClient.get<{ url: string }>("/recurso-3");

		// Esperamos un microtuck para que las tres peticiones lleguen al 401 antes de resolver el refresh.
		await new Promise((r) => setTimeout(r, 10));
		expect(postSpy).toHaveBeenCalledTimes(1);
		expect(postSpy).toHaveBeenCalledWith("/api/auth/refresh");

		resolverRefresh({ data: { accessToken: "token-renovado" } });
		const respuestas = await Promise.all([p1, p2, p3]);

		expect(respuestas.map((r) => r.data.url)).toEqual([
			"/recurso-1",
			"/recurso-2",
			"/recurso-3",
		]);
		expect(useAuthStore.getState().accessToken).toBe("token-renovado");
		expect(useAuthStore.getState().isAuthenticated).toBe(true);
	});

	it("debería cerrar la sesión si falla la renovación del token", async () => {
		useAuthStore.getState().login({
			accessToken: "token-expirado",
			usuario: usuarioDemo,
		});
		const errorRefresh = new Error("Refresh token revocado");
		const postSpy = vi.spyOn(axios, "post").mockRejectedValueOnce(errorRefresh);

		const adapter: AxiosAdapter = async (config) => {
			throw crearError401(config);
		};
		apiClient.defaults.adapter = adapter;

		await expect(apiClient.get("/usuarios")).rejects.toThrow(
			"Refresh token revocado",
		);
		expect(postSpy).toHaveBeenCalledTimes(1);
		expect(useAuthStore.getState().isAuthenticated).toBe(false);
		expect(useAuthStore.getState().accessToken).toBeNull();
	});

	it("debería rechazar sin intentar refresh cuando recibe 401 sin sesión activa", async () => {
		const postSpy = vi.spyOn(axios, "post");
		const adapter: AxiosAdapter = async (config) => {
			throw crearError401(config);
		};
		apiClient.defaults.adapter = adapter;

		await expect(apiClient.post("/auth/login")).rejects.toBeInstanceOf(
			AxiosError,
		);
		expect(postSpy).not.toHaveBeenCalled();
	});

	it("debería evitar bucles si el reintento tras refresh vuelve a devolver 401", async () => {
		useAuthStore.getState().login({
			accessToken: "token-expirado",
			usuario: usuarioDemo,
		});
		const postSpy = vi
			.spyOn(axios, "post")
			.mockResolvedValueOnce({ data: { accessToken: "token-nuevo" } } as never);

		let llamadas = 0;
		const adapter: AxiosAdapter = async (config) => {
			llamadas += 1;
			throw crearError401(config);
		};
		apiClient.defaults.adapter = adapter;

		await expect(apiClient.get("/privado")).rejects.toBeInstanceOf(AxiosError);
		expect(postSpy).toHaveBeenCalledTimes(1);
		expect(llamadas).toBe(2);
	});
});

describe("getErrorMessage", () => {
	it("debería extraer el mensaje de error de respuestas Axios y errores estándar", () => {
		const config = { headers: {} } as InternalAxiosRequestConfig;
		const axiosErr = new AxiosError(
			"Network Error",
			"ERR_NETWORK",
			config,
			null,
			crearRespuesta(config, { error: "Credenciales inválidas" }, 401),
		);

		expect(getErrorMessage(axiosErr)).toBe("Credenciales inválidas");
		expect(getErrorMessage(new Error("Fallo local"))).toBe("Fallo local");
		expect(getErrorMessage("desconocido")).toBe(
			"Ha ocurrido un error inesperado",
		);
	});
});
