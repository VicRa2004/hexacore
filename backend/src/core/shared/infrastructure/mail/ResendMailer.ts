import type { Correo, Mailer } from "@/core/shared/domain/Mailer";

/** Envío real vía la API HTTP de Resend (https://resend.com), sin dependencias. */
export class ResendMailer implements Mailer {
	constructor(
		private readonly apiKey: string,
		private readonly remitente: string,
		private readonly obtenerRemitente?: () => Promise<string>,
	) {}

	async enviar({ para, asunto, texto }: Correo): Promise<void> {
		const from = (await this.obtenerRemitente?.()) || this.remitente;
		const res = await fetch("https://api.resend.com/emails", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${this.apiKey}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				from,
				to: para,
				subject: asunto,
				text: texto,
			}),
		});
		if (!res.ok) {
			throw new Error(`Resend respondió ${res.status}: ${await res.text()}`);
		}
	}
}
