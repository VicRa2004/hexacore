import crypto from "node:crypto";
import type { Cifrador } from "../../domain/service/Cifrador";

/** AES-256-GCM: `v1:` + base64(iv · tag · cifrado). El tag detecta manipulaciones. */
export class AesGcmCifrador implements Cifrador {
	private readonly clave: Buffer;

	/** @param secreto texto de ≥ 32 caracteres; se deriva una clave de 256 bits (HKDF). */
	constructor(secreto: string) {
		this.clave = Buffer.from(
			crypto.hkdfSync("sha256", secreto, "", "hexacore-totp", 32),
		);
	}

	cifrar(texto: string): string {
		const iv = crypto.randomBytes(12);
		const cipher = crypto.createCipheriv("aes-256-gcm", this.clave, iv);
		const cifrado = Buffer.concat([
			cipher.update(texto, "utf8"),
			cipher.final(),
		]);
		return `v1:${Buffer.concat([iv, cipher.getAuthTag(), cifrado]).toString("base64")}`;
	}

	descifrar(cifrado: string): string {
		if (!cifrado.startsWith("v1:")) {
			throw new Error("Formato de cifrado desconocido");
		}
		const datos = Buffer.from(cifrado.slice(3), "base64");
		const decipher = crypto.createDecipheriv(
			"aes-256-gcm",
			this.clave,
			datos.subarray(0, 12),
		);
		decipher.setAuthTag(datos.subarray(12, 28));
		return Buffer.concat([
			decipher.update(datos.subarray(28)),
			decipher.final(),
		]).toString("utf8");
	}
}
