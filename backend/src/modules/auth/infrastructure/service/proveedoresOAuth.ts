import type {
	NombreProveedorOAuth,
	PerfilOAuth,
	ProveedorOAuth,
} from "../../domain/service/ProveedorOAuth";

interface Credenciales {
	clientId: string;
	clientSecret: string;
}

interface ConfigProveedor {
	urlAutorizacion: string;
	urlToken: string;
	scope: string;
	leerPerfil(accessToken: string): Promise<PerfilOAuth>;
}

async function getJson<T>(url: string, accessToken: string): Promise<T> {
	const res = await fetch(url, {
		headers: {
			Authorization: `Bearer ${accessToken}`,
			Accept: "application/json",
			// GitHub rechaza las peticiones sin User-Agent.
			"User-Agent": "hexacore",
		},
	});
	if (!res.ok) throw new Error(`OAuth: ${url} respondió ${res.status}`);
	return (await res.json()) as T;
}

const CONFIG: Record<NombreProveedorOAuth, ConfigProveedor> = {
	google: {
		urlAutorizacion: "https://accounts.google.com/o/oauth2/v2/auth",
		urlToken: "https://oauth2.googleapis.com/token",
		scope: "openid email profile",
		async leerPerfil(accessToken) {
			const perfil = await getJson<{
				sub: string;
				email?: string;
				email_verified?: boolean;
				name?: string;
			}>("https://openidconnect.googleapis.com/v1/userinfo", accessToken);
			return {
				idExterno: perfil.sub,
				nombre: perfil.name || perfil.email?.split("@")[0] || "Usuario",
				email: perfil.email ?? null,
				emailVerificado: perfil.email_verified === true,
			};
		},
	},
	github: {
		urlAutorizacion: "https://github.com/login/oauth/authorize",
		urlToken: "https://github.com/login/oauth/access_token",
		scope: "read:user user:email",
		async leerPerfil(accessToken) {
			const [perfil, emails] = await Promise.all([
				getJson<{ id: number; login: string; name: string | null }>(
					"https://api.github.com/user",
					accessToken,
				),
				getJson<{ email: string; primary: boolean; verified: boolean }[]>(
					"https://api.github.com/user/emails",
					accessToken,
				),
			]);
			// El email público de /user puede no estar verificado: solo vale el principal verificado.
			const principal = emails.find((e) => e.primary && e.verified);
			return {
				idExterno: String(perfil.id),
				nombre: perfil.name || perfil.login,
				email: principal?.email ?? null,
				emailVerificado: Boolean(principal),
			};
		},
	},
};

class ProveedorOAuthHttp implements ProveedorOAuth {
	private readonly config: ConfigProveedor;

	constructor(
		readonly nombre: NombreProveedorOAuth,
		private readonly credenciales: Credenciales,
	) {
		this.config = CONFIG[nombre];
	}

	urlAutorizacion(params: {
		state: string;
		codeChallenge: string;
		redirectUri: string;
	}): string {
		const query = new URLSearchParams({
			client_id: this.credenciales.clientId,
			redirect_uri: params.redirectUri,
			response_type: "code",
			scope: this.config.scope,
			state: params.state,
			code_challenge: params.codeChallenge,
			code_challenge_method: "S256",
		});
		return `${this.config.urlAutorizacion}?${query}`;
	}

	async obtenerPerfil(params: {
		code: string;
		codeVerifier: string;
		redirectUri: string;
	}): Promise<PerfilOAuth> {
		const res = await fetch(this.config.urlToken, {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/x-www-form-urlencoded",
			},
			body: new URLSearchParams({
				grant_type: "authorization_code",
				code: params.code,
				code_verifier: params.codeVerifier,
				redirect_uri: params.redirectUri,
				client_id: this.credenciales.clientId,
				client_secret: this.credenciales.clientSecret,
			}),
		});
		// GitHub responde 200 con `{ error }` cuando rechaza el código.
		const token = (await res.json().catch(() => ({}))) as {
			access_token?: string;
		};
		if (!res.ok || !token.access_token) {
			throw new Error(`OAuth ${this.nombre}: canje del código rechazado`);
		}
		return this.config.leerPerfil(token.access_token);
	}
}

/** Solo los proveedores con client id y secret configurados. */
export function crearProveedoresOAuth(
	credenciales: Partial<Record<NombreProveedorOAuth, Partial<Credenciales>>>,
): Map<NombreProveedorOAuth, ProveedorOAuth> {
	const proveedores = new Map<NombreProveedorOAuth, ProveedorOAuth>();
	for (const nombre of Object.keys(CONFIG) as NombreProveedorOAuth[]) {
		const { clientId, clientSecret } = credenciales[nombre] ?? {};
		if (clientId && clientSecret) {
			proveedores.set(
				nombre,
				new ProveedorOAuthHttp(nombre, { clientId, clientSecret }),
			);
		}
	}
	return proveedores;
}
