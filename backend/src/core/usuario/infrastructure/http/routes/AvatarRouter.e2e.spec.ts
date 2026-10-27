import { beforeAll, describe, expect, it } from "bun:test";
import { app } from "@/core/shared/infrastructure/http/server";
import { api, crearUsuario, login, vaciarUsuarios } from "@/test/e2e";

const PNG = new Uint8Array([
	0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2,
]);

function subir(token: string, datos: Uint8Array, nombre = "a.png") {
	const form = new FormData();
	form.append("archivo", new File([datos], nombre, { type: "image/png" }));
	return app.request("/api/avatares", {
		method: "PUT",
		headers: { Authorization: `Bearer ${token}` },
		body: form,
	});
}

describe("Avatares (e2e)", () => {
	let token: string;
	let id: number;

	beforeAll(async () => {
		await vaciarUsuarios();
		id = (await crearUsuario("avatar@e2e.dev")).id;
		token = await login("avatar@e2e.dev");
	});

	it("sin token → 401", async () => {
		const form = new FormData();
		form.append("archivo", new File([PNG], "a.png"));
		const res = await app.request("/api/avatares", {
			method: "PUT",
			body: form,
		});

		expect(res.status).toBe(401);
	});

	it("debería rechazar un archivo que no es imagen", async () => {
		const res = await subir(token, new TextEncoder().encode("<script>"));

		expect(res.status).toBe(400);
	});

	it("debería rechazar archivos de más de 2 MB", async () => {
		const grande = new Uint8Array(3 * 1024 * 1024);
		grande.set(PNG);

		expect((await subir(token, grande)).status).toBe(413);
	});

	it("subir, servir y quitar el avatar", async () => {
		const subida = await subir(token, PNG);
		expect(subida.status).toBe(200);
		const { avatarUrl } = await subida.json();
		expect(avatarUrl).toStartWith(`/api/avatares/${id}?v=`);

		const imagen = await api(avatarUrl);
		expect(imagen.status).toBe(200);
		expect(imagen.headers.get("Content-Type")).toBe("image/png");
		expect(new Uint8Array(await imagen.arrayBuffer())).toEqual(PNG);

		const quitado = await api("/api/avatares", { method: "DELETE", token });
		expect((await quitado.json()).avatarUrl).toBeNull();
		expect((await api(`/api/avatares/${id}`)).status).toBe(404);
	});
});
