import { env } from "@/core/config/env";
import type { AppModule } from "@/core/shared/infrastructure/di/AppModule";
import { TOKENS } from "@/core/shared/infrastructure/di/tokens";
import { USUARIO_TOKENS } from "@/core/usuario";
import { EmisorCorreosCuenta } from "./application/services/EmisorCorreosCuenta";
import { EmisorSesion } from "./application/services/EmisorSesion";
import { VerificadorDosFactores } from "./application/services/VerificadorDosFactores";
import { CambiarPasswordUseCase } from "./application/useCases/CambiarPasswordUseCase";
import { CerrarSesionUseCase } from "./application/useCases/CerrarSesionUseCase";
import { CerrarSesionesUseCase } from "./application/useCases/CerrarSesionesUseCase";
import { ListarSesionesUseCase } from "./application/useCases/ListarSesionesUseCase";
import { ActivarDosFactoresUseCase } from "./application/useCases/ActivarDosFactoresUseCase";
import { DesactivarDosFactoresUseCase } from "./application/useCases/DesactivarDosFactoresUseCase";
import { IniciarDosFactoresUseCase } from "./application/useCases/IniciarDosFactoresUseCase";
import { LoginDosFactoresUseCase } from "./application/useCases/LoginDosFactoresUseCase";
import { LoginUseCase } from "./application/useCases/LoginUseCase";
import { ObtenerDosFactoresUseCase } from "./application/useCases/ObtenerDosFactoresUseCase";
import { RegenerarCodigosRecuperacionUseCase } from "./application/useCases/RegenerarCodigosRecuperacionUseCase";
import { LogoutUseCase } from "./application/useCases/LogoutUseCase";
import { RefreshTokenUseCase } from "./application/useCases/RefreshTokenUseCase";
import { ReenviarVerificacionUseCase } from "./application/useCases/ReenviarVerificacionUseCase";
import { RegistroUseCase } from "./application/useCases/RegistroUseCase";
import { RestablecerPasswordUseCase } from "./application/useCases/RestablecerPasswordUseCase";
import { SolicitarRecuperacionUseCase } from "./application/useCases/SolicitarRecuperacionUseCase";
import { VerificarEmailUseCase } from "./application/useCases/VerificarEmailUseCase";
import { DosFactoresController } from "./infrastructure/http/controllers/DosFactoresController";
import { CuentaController } from "./infrastructure/http/controllers/CuentaController";
import { LoginController } from "./infrastructure/http/controllers/LoginController";
import { LogoutController } from "./infrastructure/http/controllers/LogoutController";
import { RefreshTokenController } from "./infrastructure/http/controllers/RefreshTokenController";
import { RegistroController } from "./infrastructure/http/controllers/RegistroController";
import { SesionController } from "./infrastructure/http/controllers/SesionController";
import { AuthMiddleware } from "./infrastructure/http/middlewares/authMiddleware";
import { AuthRouter } from "./infrastructure/http/routes/AuthRouter";
import { PrismaDosFactoresRepository } from "./infrastructure/repository/PrismaDosFactoresRepository";
import { PrismaCuentaRepository } from "./infrastructure/repository/PrismaCuentaRepository";
import { PrismaRefreshTokenRepository } from "./infrastructure/repository/PrismaRefreshTokenRepository";
import { AesGcmCifrador } from "./infrastructure/service/AesGcmCifrador";
import { JwtService } from "./infrastructure/service/JwtService";
import { AUTH_TOKENS } from "./infrastructure/tokens";

// Internos del módulo: no se comparten, así que no pasan por el contenedor.
const tokenService = new JwtService();
const refreshTokenRepo = new PrismaRefreshTokenRepository();
const cuentaRepo = new PrismaCuentaRepository();
const dosFactoresRepo = new PrismaDosFactoresRepository();
const cifrador = new AesGcmCifrador(env.TOTP_ENCRYPTION_KEY ?? env.JWT_SECRET);
/** Nombre que muestra la app de autenticación junto a la cuenta. */
const EMISOR_TOTP = "Hexacore";

export const authModule: AppModule = {
	register(container) {
		container.set(
			AUTH_TOKENS.AuthMiddleware,
			() => new AuthMiddleware(tokenService),
		);
	},
	mount(app, container) {
		const usuarios = container.get(USUARIO_TOKENS.UsuarioRepository);
		const hasher = container.get(USUARIO_TOKENS.PasswordHasher);
		const sesiones = new EmisorSesion(tokenService, refreshTokenRepo);
		const correos = new EmisorCorreosCuenta(
			tokenService,
			cuentaRepo,
			container.get(TOKENS.Mailer),
			env.APP_URL,
		);
		const eventBus = container.get(TOKENS.EventBus);
		const uow = container.get(TOKENS.UnitOfWork);
		const verificador = new VerificadorDosFactores(
			dosFactoresRepo,
			cifrador,
			cuentaRepo,
		);

		const router = new AuthRouter(
			new LoginController({
				login: new LoginUseCase(
					usuarios,
					hasher,
					sesiones,
					cuentaRepo,
					dosFactoresRepo,
					tokenService,
				),
				loginDosFactores: new LoginDosFactoresUseCase(
					tokenService,
					usuarios,
					verificador,
					sesiones,
				),
			}),
			new RegistroController(
				new RegistroUseCase(usuarios, hasher, sesiones, correos),
			),
			new RefreshTokenController(
				new RefreshTokenUseCase(
					tokenService,
					refreshTokenRepo,
					usuarios,
					sesiones,
				),
			),
			new LogoutController(new LogoutUseCase(tokenService, refreshTokenRepo)),
			new CuentaController({
				solicitarRecuperacion: new SolicitarRecuperacionUseCase(
					usuarios,
					correos,
				),
				restablecerPassword: new RestablecerPasswordUseCase(
					tokenService,
					cuentaRepo,
					usuarios,
					hasher,
					refreshTokenRepo,
				),
				verificarEmail: new VerificarEmailUseCase(tokenService, cuentaRepo),
				reenviarVerificacion: new ReenviarVerificacionUseCase(
					usuarios,
					correos,
				),
				cambiarPassword: new CambiarPasswordUseCase(
					usuarios,
					hasher,
					refreshTokenRepo,
					sesiones,
				),
				cerrarSesiones: new CerrarSesionesUseCase(refreshTokenRepo),
			}),
			new SesionController({
				listar: new ListarSesionesUseCase(tokenService, refreshTokenRepo),
				cerrar: new CerrarSesionUseCase(refreshTokenRepo),
			}),
			new DosFactoresController({
				obtener: new ObtenerDosFactoresUseCase(dosFactoresRepo),
				iniciar: new IniciarDosFactoresUseCase(
					usuarios,
					dosFactoresRepo,
					cifrador,
					EMISOR_TOTP,
				),
				activar: new ActivarDosFactoresUseCase(
					dosFactoresRepo,
					cifrador,
					eventBus,
					uow,
				),
				desactivar: new DesactivarDosFactoresUseCase(
					usuarios,
					hasher,
					verificador,
					dosFactoresRepo,
					eventBus,
					uow,
				),
				regenerarCodigos: new RegenerarCodigosRecuperacionUseCase(
					verificador,
					dosFactoresRepo,
				),
			}),
			container.get(AUTH_TOKENS.AuthMiddleware),
		);
		app.route("/api/auth", router.router);
	},
	onStart(container) {
		container
			.get(TOKENS.Scheduler)
			.programar("auth.limpiar-tokens", 60 * 60 * 1000, async () => {
				await refreshTokenRepo.eliminarExpirados();
				await cuentaRepo.eliminarTokensCaducados();
			});
		return undefined;
	},
};
