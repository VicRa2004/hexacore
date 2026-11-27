import type { LectorAjustes } from "@/core/shared/domain/AjustesSistema";
import { BaseError } from "@/core/shared/domain/error/BaseError";
import type { UnitOfWork } from "@/core/shared/domain/UnitOfWork";
import type { PasswordHasher, UsuarioRepository } from "@/core/usuario";
import { Usuario } from "@/core/usuario";
import type { CuentaOAuthRepository } from "../../domain/repository/CuentaOAuthRepository";
import type { CuentaRepository } from "../../domain/repository/CuentaRepository";
import type {
	NombreProveedorOAuth,
	PerfilOAuth,
} from "../../domain/service/ProveedorOAuth";
import type { TokenService } from "../../domain/service/TokenService";

/** El código viaja en la URL de vuelta a la web: un solo uso y vida muy corta. */
const VIGENCIA_CODIGO_MS = 2 * 60 * 1000;

/**
 * Vuelta del proveedor en modo login: resuelve el usuario (cuenta ya vinculada,
 * usuario con el mismo email verificado o alta nueva) y emite un código de un solo
 * uso que la web canjea por la sesión en `POST /oauth/canjear`.
 */
export class AutenticarOAuthUseCase {
	constructor(
		private readonly usuarios: UsuarioRepository,
		private readonly hasher: PasswordHasher,
		private readonly cuentasOAuth: CuentaOAuthRepository,
		private readonly cuentaRepo: CuentaRepository,
		private readonly tokenService: TokenService,
		private readonly uow: UnitOfWork,
		private readonly ajustes?: LectorAjustes,
	) {}

	async ejecutar(
		proveedor: NombreProveedorOAuth,
		perfil: PerfilOAuth,
	): Promise<string> {
		const usuarioId = await this.uow.ejecutar(() =>
			this.resolverUsuario(proveedor, perfil),
		);

		const codigo = this.tokenService.generarRefreshToken();
		await this.cuentaRepo.crearToken({
			usuarioId,
			tipo: "oauth_login",
			tokenHash: this.tokenService.hashearRefreshToken(codigo),
			expiraEn: new Date(Date.now() + VIGENCIA_CODIGO_MS),
		});
		return codigo;
	}

	private async resolverUsuario(
		proveedor: NombreProveedorOAuth,
		perfil: PerfilOAuth,
	): Promise<number> {
		const vinculado = await this.cuentasOAuth.buscarUsuarioId(
			proveedor,
			perfil.idExterno,
		);
		if (vinculado) return vinculado;

		// Sin email verificado por el proveedor no se puede vincular ni dar de alta:
		// cualquiera podría declarar el email de otro usuario.
		if (!perfil.email || !perfil.emailVerificado) {
			throw new BaseError(
				`Tu cuenta de ${proveedor} no tiene un email verificado`,
				400,
			);
		}

		const usuario =
			(await this.usuarios.buscarPorEmail(perfil.email)) ??
			(await this.darDeAlta(perfil.nombre, perfil.email));

		await this.cuentasOAuth.vincular({
			usuarioId: usuario.getId(),
			proveedor,
			idExterno: perfil.idExterno,
			email: perfil.email,
		});
		return usuario.getId();
	}

	private async darDeAlta(nombre: string, email: string): Promise<Usuario> {
		if (this.ajustes) {
			const { registroPublicoAbierto } = await this.ajustes.obtener();
			if (!registroPublicoAbierto) {
				throw new BaseError("El registro público está desactivado", 403);
			}
		}
		// Contraseña aleatoria que nadie conoce: si quiere una, usa «¿Olvidaste tu contraseña?».
		const passwordHash = await this.hasher.hash(
			this.tokenService.generarRefreshToken(),
		);
		const usuario = await this.usuarios.crear(
			Usuario.crear(nombre, email, passwordHash),
		);
		await this.cuentaRepo.marcarEmailVerificado(usuario.getId());
		return usuario;
	}
}
