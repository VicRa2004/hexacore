import type { Context } from "hono";
import { BaseError } from "@/core/shared/domain/error/BaseError";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import { log } from "@/core/shared/infrastructure/logger";
import type { AutenticarOAuthUseCase } from "../../../application/useCases/AutenticarOAuthUseCase";
import type { CanjearOAuthUseCase } from "../../../application/useCases/CanjearOAuthUseCase";
import type { DesvincularOAuthUseCase } from "../../../application/useCases/DesvincularOAuthUseCase";
import type { ListarCuentasOAuthUseCase } from "../../../application/useCases/ListarCuentasOAuthUseCase";
import type { VincularOAuthUseCase } from "../../../application/useCases/VincularOAuthUseCase";
import type {
	NombreProveedorOAuth,
	ProveedorOAuth,
} from "../../../domain/service/ProveedorOAuth";
import type { AuthEnv } from "../middlewares/authMiddleware";
import {
	consumirEstadoOAuth,
	guardarEstadoOAuth,
	nuevoEstadoOAuth,
} from "../oauthCookie";
import { setRefreshTokenCookie } from "../refreshTokenCookie";
import {
	callbackOAuthQuerySchema,
	canjearOAuthSchema,
	proveedorParamSchema,
} from "../schemas/oauthSchemas";

/**
 * Login social (Authorization Code + PKCE). La web pide la URL del proveedor,
 * navega a ella y el proveedor vuelve a `/callback`, que redirige a la web
 * (`/oauth-callback#…`) con un código de un solo uso, la cuenta vinculada o el error.
 */
export class OAuthController extends BaseController {
	constructor(
		private readonly proveedores: Map<NombreProveedorOAuth, ProveedorOAuth>,
		private readonly appUrl: string,
		private readonly useCases: {
			autenticar: AutenticarOAuthUseCase;
			canjear: CanjearOAuthUseCase;
			vincular: VincularOAuthUseCase;
			listar: ListarCuentasOAuthUseCase;
			desvincular: DesvincularOAuthUseCase;
		},
	) {
		super();
	}

	disponibles = (c: Context): Promise<Response> =>
		this.executeSafely(c, async () =>
			this.ok(c, { proveedores: [...this.proveedores.keys()] }),
		);

	iniciar = (c: Context): Promise<Response> =>
		this.executeSafely(c, () => this.urlProveedor(c));

	vincular = (c: Context<AuthEnv>): Promise<Response> =>
		this.executeSafely(c, () => this.urlProveedor(c, c.get("usuario").id));

	callback = async (c: Context): Promise<Response> => {
		const destino = new URLSearchParams();
		try {
			const estado = await consumirEstadoOAuth(c);
			const proveedor = this.proveedor(c);
			const { code, state, error } = validate(
				callbackOAuthQuerySchema,
				c.req.query(),
			);
			if (error) {
				throw new BaseError(
					`Se canceló el acceso con ${proveedor.nombre}`,
					400,
				);
			}
			if (
				!estado ||
				!code ||
				state !== estado.state ||
				estado.proveedor !== proveedor.nombre
			) {
				throw new BaseError(
					"La solicitud caducó o no es válida. Vuelve a intentarlo.",
					400,
				);
			}

			const perfil = await proveedor.obtenerPerfil({
				code,
				codeVerifier: estado.codeVerifier,
				redirectUri: this.redirectUri(proveedor.nombre),
			});
			if (estado.usuarioId) {
				await this.useCases.vincular.ejecutar(
					estado.usuarioId,
					proveedor.nombre,
					perfil,
				);
				destino.set("vinculada", proveedor.nombre);
			} else {
				destino.set(
					"codigo",
					await this.useCases.autenticar.ejecutar(proveedor.nombre, perfil),
				);
			}
		} catch (error) {
			if (!(error instanceof BaseError)) {
				log.error("OAuth: fallo en la vuelta del proveedor", {
					error: error instanceof Error ? error.message : String(error),
				});
			}
			destino.set(
				"error",
				error instanceof BaseError
					? error.message
					: "No se pudo completar el acceso. Inténtalo de nuevo.",
			);
		}
		// En el fragmento: no llega a los logs del servidor ni viaja en el Referer.
		return c.redirect(`${this.appUrl}/oauth-callback#${destino}`);
	};

	canjear = (c: Context): Promise<Response> =>
		this.executeSafely(c, async () => {
			const { codigo } = validate(canjearOAuthSchema, await c.req.json());
			const resultado = await this.useCases.canjear.ejecutar(codigo);
			if ("requiere2fa" in resultado) return this.ok(c, resultado);

			const { refreshToken, ...sesion } = resultado;
			setRefreshTokenCookie(c, refreshToken);
			return this.ok(c, sesion);
		});

	cuentas = (c: Context<AuthEnv>): Promise<Response> =>
		this.executeSafely(c, async () =>
			this.ok(c, await this.useCases.listar.ejecutar(c.get("usuario").id)),
		);

	desvincular = (c: Context<AuthEnv>): Promise<Response> =>
		this.executeSafely(c, async () => {
			const { proveedor } = validate(proveedorParamSchema, c.req.param());
			await this.useCases.desvincular.ejecutar(c.get("usuario").id, proveedor);
			return this.ok(c, { mensaje: "Cuenta desvinculada" });
		});

	private async urlProveedor(c: Context, usuarioId?: number) {
		const proveedor = this.proveedor(c);
		const { estado, codeChallenge } = nuevoEstadoOAuth(
			proveedor.nombre,
			usuarioId,
		);
		await guardarEstadoOAuth(c, estado);
		return this.ok(c, {
			url: proveedor.urlAutorizacion({
				state: estado.state,
				codeChallenge,
				redirectUri: this.redirectUri(proveedor.nombre),
			}),
		});
	}

	private proveedor(c: Context): ProveedorOAuth {
		const { proveedor } = validate(proveedorParamSchema, c.req.param());
		const configurado = this.proveedores.get(proveedor);
		if (!configurado) {
			throw new BaseError(
				`El acceso con ${proveedor} no está configurado`,
				404,
			);
		}
		return configurado;
	}

	// Mismo origen que la web (en dev, a través del proxy /api de Vite).
	private redirectUri(proveedor: NombreProveedorOAuth): string {
		return `${this.appUrl}/api/auth/oauth/${proveedor}/callback`;
	}
}
