import { describe, expect, it } from "bun:test";
import { AesGcmCifrador } from "./AesGcmCifrador";

const CLAVE = "una_clave_de_prueba_de_al_menos_32_caracteres";

describe("AesGcmCifrador", () => {
	it("cifra con IV aleatorio y descifra el original", () => {
		const cifrador = new AesGcmCifrador(CLAVE);
		const a = cifrador.cifrar("JBSWY3DPEHPK3PXP");
		const b = cifrador.cifrar("JBSWY3DPEHPK3PXP");
		expect(a).not.toBe(b);
		expect(a).not.toContain("JBSWY3DPEHPK3PXP");
		expect(cifrador.descifrar(a)).toBe("JBSWY3DPEHPK3PXP");
	});

	it("falla con otra clave o si el cifrado se manipula", () => {
		const cifrado = new AesGcmCifrador(CLAVE).cifrar("secreto");
		expect(() =>
			new AesGcmCifrador(`${CLAVE}_otra`).descifrar(cifrado),
		).toThrow();
		const datos = Buffer.from(cifrado.slice(3), "base64");
		datos[datos.length - 1] = (datos.at(-1) ?? 0) ^ 1;
		expect(() =>
			new AesGcmCifrador(CLAVE).descifrar(`v1:${datos.toString("base64")}`),
		).toThrow();
	});
});
