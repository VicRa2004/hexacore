import { env } from "@/core/config/env";
import type { AppModule } from "@/core/shared/infrastructure/di/AppModule";
import { TOKENS } from "@/core/shared/infrastructure/di/tokens";
import { USUARIO_TOKENS } from "@/core/usuario";
import { EmisorCorreosCuenta } from "./application/services/EmisorCorreosCuenta";
import { EmisorSesion } from "./application/services/EmisorSesion";
import { CambiarPasswordUseCase } from "./application/useCases/CambiarPasswordUseCase";
import { CerrarSesionesUseCase } from "./application/useCases/CerrarSesionesUseCase";
import { LoginUseCase } from "./application/useCases/LoginUseCase";
import { LogoutUseCase } from "./application/useCases/LogoutUseCase";
import { RefreshTokenUseCase } from "./application/useCases/RefreshTokenUseCase";
import { ReenviarVerificacionUseCase } from "./application/useCases/ReenviarVerificacionUseCase";
import { RegistroUseCase } from "./application/useCases/RegistroUseCase";
import { RestablecerPasswordUseCase } from "./application/useCases/RestablecerPasswordUseCase";
import { SolicitarRecuperacionUseCase } from "./application/useCases/SolicitarRecuperacionUseCase";
import { VerificarEmailUseCase } from "./application/useCases/VerificarEmailUseCase";
import { CuentaController } from "./infrastructure/http/controllers/CuentaController";
import { LoginController } from "./infrastructure/http/controllers/LoginController";
import { LogoutController } from "./infrastructure/http/controllers/LogoutController";
import { RefreshTokenController } from "./infrastructure/http/controllers/RefreshTokenController";
import { RegistroController } from "./infrastructure/http/controllers/RegistroController";
import { AuthMiddleware } from "./infrastructure/http/middlewares/authMiddleware";
import { AuthRouter } from "./infrastructure/http/routes/AuthRouter";
import { PrismaCuentaRepository } from "./infrastructure/repository/PrismaCuentaRepository";
import { PrismaRefreshTokenRepository } from "./infrastructure/repository/PrismaRefreshTokenRepository";
import { JwtService } from "./infrastructure/service/JwtService";
import { AUTH_TOKENS } from "./infrastructure/tokens";

// Internos del módulo: no se comparten, así que no pasan por el contenedor.
const tokenService = new JwtService();
const refreshTokenRepo = new PrismaRefreshTokenRepository();
const cuentaRepo = new PrismaCuentaRepository();

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

		const router = new AuthRouter(
			new LoginController(
				new LoginUseCase(usuarios, hasher, sesiones, cuentaRepo),
			),
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
