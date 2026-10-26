import { beforeEach, describe, expect, it, mock, spyOn } from "bun:test";

const queryRaw = mock(() => Promise.resolve([{ "?column?": 1 }]));
mock.module("@/core/config/prisma", () => ({
	prisma: { $queryRaw: queryRaw },
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
			error: "Internal Server Error",
			requestId: res.headers.get("X-Request-Id"),
		});
		expect(body.requestId).toBeString();
	});
});
