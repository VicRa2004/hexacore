import type { Correo, Mailer } from "@/core/shared/domain/Mailer";

/**
 * Mailer de desarrollo: escribe el correo en consola.
 * En prod no imprime el cuerpo: los enlaces de un solo uso no deben acabar en los logs.
 */
export class ConsoleMailer implements Mailer {
	constructor(private readonly isProd: boolean) {}

	async enviar({ para, asunto, texto }: Correo): Promise<void> {
		if (this.isProd) {
			console.warn(
				`[Mailer] Correo "${asunto}" a ${para} NO enviado: define RESEND_API_KEY.`,
			);
			return;
		}
		console.log(`[Mailer] Para: ${para}\nAsunto: ${asunto}\n\n${texto}\n`);
	}
}
