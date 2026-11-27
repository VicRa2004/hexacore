import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { prisma } from "@/core/config/prisma";
import { TOKENS } from "@/core/shared/infrastructure/di/tokens";
import { container } from "@/core/shared/infrastructure/di/container";
import { app } from "@/core/shared/infrastructure/http/server";
import { api, crearUsuario, login, vaciarUsuarios } from "@/test/e2e";

const PNG = new Uint8Array([
	0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2,
]);
const ICO = new Uint8Array([0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x10, 0x10]);

async function subirImagen(
	tipo: "logo" | "favicon",
	token: string,
	datos: Uint8Array,
	nombre: string,
) {
	const form = new FormData();
	form.append("archivo", new File([datos], nombre, { type: "image/png" }));
	return app.request(`/api/ajustes/${tipo}`, {
		method: "PUT",
		headers: { Authorization: `Bearer ${token}` },
		body: form,
	});
}

describe("Ajustes del sistema (e2e)", () => {
	let adminToken: string;
	let usuarioToken: string;

	beforeAll(async () => {
		await prisma.ajuste.deleteMany();
		container.get(TOKENS.LectorAjustes).invalidar();
		await vaciarUsuarios();
		await crearUsuario("admin-ajustes@e2e.dev", "ADMIN");
		await crearUsuario("user-ajustes@e2e.dev", "USUARIO");
		adminToken = await login("admin-ajustes@e2e.dev");
		usuarioToken = await login("user-ajustes@e2e.dev");
	});

	afterAll(async () => {
		await prisma.ajuste.deleteMany();
		container.get(TOKENS.LectorAjustes).invalidar();
	});

	it("GET /api/ajustes/publicos es público y no expone remitenteCorreo", async () => {
		const res = await api("/api/ajustes/publicos");
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body).toEqual({
			nombreApp: "Hexacore",
			colorMarca: 277,
			registroPublicoAbierto: true,
			logoUrl: null,
			faviconUrl: null,
		});
		expect("remitenteCorreo" in body).toBe(false);
	});

	it("GET y PUT /api/ajustes exigen autenticación y permiso", async () => {
		expect((await api("/api/ajustes")).status).toBe(401);
		expect((await api("/api/ajustes", { token: usuarioToken })).status).toBe(
			403,
		);
		expect(
			(
				await api("/api/ajustes", {
					method: "PUT",
					token: usuarioToken,
					body: { nombreApp: "Otro" },
				})
			).status,
		).toBe(403);
	});

	it("PUT /api/ajustes actualiza los valores, invalida caché y afecta al registro", async () => {
		const res = await api("/api/ajustes", {
			method: "PUT",
			token: adminToken,
			body: {
				nombreApp: "Mi Empresa",
				colorMarca: 160,
				remitenteCorreo: "Mi Empresa <hola@empresa.dev>",
				registroPublicoAbierto: false,
			},
		});
		expect(res.status).toBe(200);
		expect(await res.json()).toMatchObject({
			nombreApp: "Mi Empresa",
			colorMarca: 160,
			remitenteCorreo: "Mi Empresa <hola@empresa.dev>",
			registroPublicoAbierto: false,
		});

		const publicos = await (await api("/api/ajustes/publicos")).json();
		expect(publicos).toMatchObject({
			nombreApp: "Mi Empresa",
			colorMarca: 160,
			registroPublicoAbierto: false,
		});

		const registro = await api("/api/auth/registro", {
			method: "POST",
			body: {
				nombre: "Nuevo",
				email: "bloqueado@e2e.dev",
				password: "PasswordSegura123!",
			},
			ip: "10.0.1.99",
		});
		expect(registro.status).toBe(403);
	});

	it("subir, servir y quitar logo y favicon", async () => {
		const invalido = await subirImagen(
			"logo",
			adminToken,
			new TextEncoder().encode("<svg/>"),
			"mal.svg",
		);
		expect(invalido.status).toBe(400);

		const subidaLogo = await subirImagen("logo", adminToken, PNG, "logo.png");
		expect(subidaLogo.status).toBe(200);
		const { logoUrl } = await subidaLogo.json();
		expect(logoUrl).toStartWith("/api/ajustes/logo?v=");

		const imgLogo = await api(logoUrl);
		expect(imgLogo.status).toBe(200);
		expect(imgLogo.headers.get("Content-Type")).toBe("image/png");
		expect(new Uint8Array(await imgLogo.arrayBuffer())).toEqual(PNG);

		const subidaFav = await subirImagen(
			"favicon",
			adminToken,
			ICO,
			"favicon.ico",
		);
		expect(subidaFav.status).toBe(200);
		const { faviconUrl } = await subidaFav.json();
		expect(faviconUrl).toStartWith("/api/ajustes/favicon?v=");

		const imgFav = await api(faviconUrl);
		expect(imgFav.status).toBe(200);
		expect(imgFav.headers.get("Content-Type")).toBe("image/x-icon");

		const quitadoLogo = await api("/api/ajustes/logo", {
			method: "DELETE",
			token: adminToken,
		});
		expect((await quitadoLogo.json()).logoUrl).toBeNull();
		expect((await api("/api/ajustes/logo")).status).toBe(404);

		const quitadoFav = await api("/api/ajustes/favicon", {
			method: "DELETE",
			token: adminToken,
		});
		expect((await quitadoFav.json()).faviconUrl).toBeNull();
		expect((await api("/api/ajustes/favicon")).status).toBe(404);
	});
});
