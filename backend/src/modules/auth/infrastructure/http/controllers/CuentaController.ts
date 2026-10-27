import type { Context } from "hono";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { CambiarPasswordUseCase } from "../../../application/useCases/CambiarPasswordUseCase";
import type { CerrarSesionesUseCase } from "../../../application/useCases/CerrarSesionesUseCase";
import type { ReenviarVerificacionUseCase } from "../../../application/useCases/ReenviarVerificacionUseCase";
import type { RestablecerPasswordUseCase } from "../../../application/useCases/RestablecerPasswordUseCase";
import type { SolicitarRecuperacionUseCase } from "../../../application/useCases/SolicitarRecuperacionUseCase";
import type { VerificarEmailUseCase } from "../../../application/useCases/VerificarEmailUseCase";
import type { AuthEnv } from "../middlewares/authMiddleware";
import {
	clearRefreshTokenCookie,
	setRefreshTokenCookie,
} from "../refreshTokenCookie";
import {
	cambiarPasswordSchema,
	recuperarPasswordSchema,
	restablecerPasswordSchema,
	verificarEmailSchema,
} from "../schemas/authSchemas";

/** Recuperación de contraseña, verificación de email y gestión de sesiones. */
export class CuentaController extends BaseController {
	constructor(
		private readonly useCases: {
			solicitarRecuperacion: SolicitarRecuperacionUseCase;
			restablecerPassword: RestablecerPasswordUseCase;
			verificarEmail: VerificarEmailUseCase;
			reenviarVerificacion: ReenviarVerificacionUseCase;
			cambiarPassword: CambiarPasswordUseCase;
			cerrarSesiones: CerrarSesionesUseCase;
		},
	) {
		super();
	}

	solicitarRecuperacion = (c: Context): Promise<Response> =>
		this.executeSafely(c, async () => {
			const { email } = validate(recuperarPasswordSchema, await c.req.json());
			await this.useCases.solicitarRecuperacion.ejecutar(email);
			// Misma respuesta exista o no el email.
			return this.ok(c, {
				mensaje:
					"Si el email está registrado, recibirás un enlace para restablecer la contraseña.",
			});
		});

	restablecerPassword = (c: Context): Promise<Response> =>
		this.executeSafely(c, async () => {
			const dto = validate(restablecerPasswordSchema, await c.req.json());
			await this.useCases.restablecerPassword.ejecutar(dto);
			return this.ok(c, {
				mensaje: "Contraseña restablecida. Ya puedes iniciar sesión.",
			});
		});

	verificarEmail = (c: Context): Promise<Response> =>
		this.executeSafely(c, async () => {
			const { token } = validate(verificarEmailSchema, await c.req.json());
			await this.useCases.verificarEmail.ejecutar(token);
			return this.ok(c, { mensaje: "Email verificado correctamente" });
		});

	reenviarVerificacion = (c: Context<AuthEnv>): Promise<Response> =>
		this.executeSafely(c, async () => {
			await this.useCases.reenviarVerificacion.ejecutar(c.get("usuario").id);
			return this.ok(c, { mensaje: "Te hemos enviado un nuevo enlace" });
		});

	cambiarPassword = (c: Context<AuthEnv>): Promise<Response> =>
		this.executeSafely(c, async () => {
			const dto = validate(cambiarPasswordSchema, await c.req.json());
			const { refreshToken, accessToken } =
				await this.useCases.cambiarPassword.ejecutar(c.get("usuario").id, dto);

			setRefreshTokenCookie(c, refreshToken);
			return this.ok(c, { accessToken });
		});

	cerrarSesiones = (c: Context<AuthEnv>): Promise<Response> =>
		this.executeSafely(c, async () => {
			await this.useCases.cerrarSesiones.ejecutar(c.get("usuario").id);
			clearRefreshTokenCookie(c);
			return this.ok(c, { mensaje: "Se han cerrado todas las sesiones" });
		});
}
