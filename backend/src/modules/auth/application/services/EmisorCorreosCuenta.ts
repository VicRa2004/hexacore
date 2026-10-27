import type { Mailer } from "@/core/shared/domain/Mailer";
import type { Usuario } from "@/core/usuario";
import type {
	CuentaRepository,
	TipoTokenCuenta,
} from "../../domain/repository/CuentaRepository";
import type { TokenService } from "../../domain/service/TokenService";

const HORA = 60 * 60 * 1000;

const PLANTILLAS: Record<
	TipoTokenCuenta,
	{ ruta: string; vigenciaMs: number; asunto: string; texto: string }
> = {
	recuperar_password: {
		ruta: "/restablecer-password",
		vigenciaMs: HORA,
		asunto: "Restablece tu contraseña",
		texto:
			"Has pedido restablecer tu contraseña. Abre este enlace (caduca en 1 hora):",
	},
	verificar_email: {
		ruta: "/verificar-email",
		vigenciaMs: 24 * HORA,
		asunto: "Verifica tu email",
		texto:
			"Confirma tu dirección de email con este enlace (caduca en 24 horas):",
	},
};

/**
 * Genera un token de un solo uso, guarda su hash y envía el enlace por correo.
 * El token en claro solo viaja en el correo.
 */
export class EmisorCorreosCuenta {
	constructor(
		private readonly tokenService: TokenService,
		private readonly cuentaRepo: CuentaRepository,
		private readonly mailer: Mailer,
		private readonly appUrl: string,
	) {}

	async enviar(usuario: Usuario, tipo: TipoTokenCuenta): Promise<void> {
		const plantilla = PLANTILLAS[tipo];
		const token = this.tokenService.generarRefreshToken();

		await this.cuentaRepo.crearToken({
			usuarioId: usuario.getId(),
			tipo,
			tokenHash: this.tokenService.hashearRefreshToken(token),
			expiraEn: new Date(Date.now() + plantilla.vigenciaMs),
		});

		const enlace = `${this.appUrl}${plantilla.ruta}?token=${token}`;
		await this.mailer.enviar({
			para: usuario.getEmail(),
			asunto: plantilla.asunto,
			texto: `Hola, ${usuario.getNombre()}:\n\n${plantilla.texto}\n${enlace}\n\nSi no lo pediste tú, ignora este correo.`,
		});
	}
}
