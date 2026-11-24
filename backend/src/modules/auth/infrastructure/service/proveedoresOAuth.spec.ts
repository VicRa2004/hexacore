import { afterEach, describe, expect, it, spyOn } from "bun:test";
import { crearProveedoresOAuth } from "./proveedoresOAuth";

const credenciales = { clientId: "id", clientSecret: "secreto" };

const json = (cuerpo: unknown, status = 200) =>
	new Response(JSON.stringify(cuerpo), { status });

describe("crearProveedoresOAuth", () => {
	afterEach(() => {
		(
			globalThis.fetch as unknown as { mockRestore?: () => void }
		).mockRestore?.();
	});

	it("solo activa los proveedores con client id y secret", () => {
		const proveedores = crearProveedoresOAuth({
			google: credenciales,
			github: { clientId: "id" },
		});
		expect([...proveedores.keys()]).toEqual(["google"]);
	});

	it("la URL de autorización lleva state y PKCE S256", () => {
		const google = crearProveedoresOAuth({ google: credenciales }).get(
			"google",
		);
		const url = new URL(
			google?.urlAutorizacion({
				state: "st",
				codeChallenge: "ch",
				redirectUri: "http://app/cb",
			}) ?? "",
		);
		expect(url.origin).toBe("https://accounts.google.com");
		expect(Object.fromEntries(url.searchParams)).toMatchObject({
			client_id: "id",
			state: "st",
			code_challenge: "ch",
			code_challenge_method: "S256",
			redirect_uri: "http://app/cb",
			response_type: "code",
		});
	});

	it("GitHub: canjea el código con el verificador y usa el email principal verificado", async () => {
		const fetchMock = spyOn(globalThis, "fetch").mockImplementation((async (
			url: string,
		) => {
			if (url.endsWith("/access_token")) return json({ access_token: "tk" });
			if (url.endsWith("/user/emails"))
				return json([
					{ email: "publico@x.com", primary: false, verified: true },
					{ email: "principal@x.com", primary: true, verified: true },
				]);
			return json({ id: 42, login: "ana", name: null });
		}) as unknown as typeof fetch);

		const github = crearProveedoresOAuth({ github: credenciales }).get(
			"github",
		);
		const perfil = await github?.obtenerPerfil({
			code: "c",
			codeVerifier: "v",
			redirectUri: "http://app/cb",
		});

		expect(perfil).toEqual({
			idExterno: "42",
			nombre: "ana",
			email: "principal@x.com",
			emailVerificado: true,
		});
		const cuerpo = fetchMock.mock.calls[0]?.[1]?.body as URLSearchParams;
		expect(cuerpo.get("code_verifier")).toBe("v");
	});

	it("GitHub: sin email principal verificado no da email", async () => {
		spyOn(globalThis, "fetch").mockImplementation((async (url: string) => {
			if (url.endsWith("/access_token")) return json({ access_token: "tk" });
			if (url.endsWith("/user/emails"))
				return json([{ email: "a@x.com", primary: true, verified: false }]);
			return json({ id: 1, login: "a", name: "A" });
		}) as unknown as typeof fetch);

		const perfil = await crearProveedoresOAuth({ github: credenciales })
			.get("github")
			?.obtenerPerfil({ code: "c", codeVerifier: "v", redirectUri: "r" });
		expect(perfil).toMatchObject({ email: null, emailVerificado: false });
	});

	it("falla si el proveedor rechaza el código (GitHub responde 200 con error)", async () => {
		spyOn(globalThis, "fetch").mockImplementation((async () =>
			json({ error: "bad_verification_code" })) as unknown as typeof fetch);

		await expect(
			crearProveedoresOAuth({ github: credenciales })
				.get("github")
				?.obtenerPerfil({ code: "c", codeVerifier: "v", redirectUri: "r" }),
		).rejects.toThrow("canje del código rechazado");
	});
});
