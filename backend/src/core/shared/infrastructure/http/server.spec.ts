import { beforeEach, describe, expect, it, mock, spyOn } from "bun:test";

const queryRaw = mock(() => Promise.resolve([{ "?column?": 1 }]));
mock.module("@/core/config/prisma", () => ({
	prisma: { $queryRaw: queryRaw },
	enTransaccion: <T>(trabajo: () => Promise<T>) => trabajo(),
}));

const { app } = await import("./server");
app.get("/boom", () => {
	throw new Error("connect ECONNREFUSED db:5432");
});

describe("server", () => {
	beforeEach(() => queryRaw.mockClear());

	it("/health debería responder 200 sin consultar la BD", async () => {
		const res = await app.request("/health");

		expect(res.status).toBe(200);
		expect(queryRaw).not.toHaveBeenCalled();
	});

	it("/ready debería responder 200 si la BD responde", async () => {
		const res = await app.request("/ready");

		expect(res.status).toBe(200);
	});

	it("/ready debería responder 503 si la BD no responde", async () => {
		queryRaw.mockImplementationOnce(() => Promise.reject(new Error("down")));

		const res = await app.request("/ready");

		expect(res.status).toBe(503);
	});

	it("debería devolver el request id en los 5xx sin exponer el mensaje interno", async () => {
		spyOn(console, "error").mockImplementation(() => {});

		const res = await app.request("/boom");
		const body = await res.json();

		expect(res.status).toBe(500);
		expect(body).toEqual({
			error: "Error interno del servidor",
			requestId: res.headers.get("X-Request-Id"),
		});
		expect(body.requestId).toBeString();
	});

	it("POST /api/monitoreo debería responder 400 ante un sobre inválido", async () => {
		const res = await app.request("/api/monitoreo", {
			method: "POST",
			body: "sobre-invalido",
		});

		expect(res.status).toBe(400);
	});

	it("POST /api/telemetria/v1/traces debería responder 400 si OTel no está configurado", async () => {
		const res = await app.request("/api/telemetria/v1/traces", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: "{}",
		});

		expect(res.status).toBe(400);
	});
});
