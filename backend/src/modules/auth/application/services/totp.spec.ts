import { describe, expect, it } from "bun:test";
import {
	generarCodigosRecuperacion,
	generarCodigoTotp,
	generarSecretoTotp,
	hashearCodigoRecuperacion,
	uriOtpauth,
	verificarCodigoTotp,
} from "./totp";

// RFC 6238, apéndice B: clave ASCII "12345678901234567890" (SHA-1), 6 últimos dígitos.
const SECRETO_RFC = "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ";

describe("totp", () => {
	it("genera los códigos de los vectores de la RFC 6238", () => {
		expect(generarCodigoTotp(SECRETO_RFC, 59_000)).toBe("287082");
		expect(generarCodigoTotp(SECRETO_RFC, 1_111_111_109_000)).toBe("081804");
		expect(generarCodigoTotp(SECRETO_RFC, 2_000_000_000_000)).toBe("279037");
	});

	it("acepta el paso anterior y el siguiente, y devuelve el paso que coincide", () => {
		const ahora = 1_111_111_109_000;
		const paso = Math.floor(ahora / 30_000);
		expect(verificarCodigoTotp(SECRETO_RFC, "081804", ahora)).toBe(paso);
		expect(verificarCodigoTotp(SECRETO_RFC, "081804", ahora + 30_000)).toBe(
			paso,
		);
		expect(verificarCodigoTotp(SECRETO_RFC, "081804", ahora - 30_000)).toBe(
			paso,
		);
		expect(
			verificarCodigoTotp(SECRETO_RFC, "081804", ahora + 60_000),
		).toBeNull();
	});

	it("rechaza códigos mal formados o incorrectos", () => {
		expect(verificarCodigoTotp(SECRETO_RFC, "12345", 59_000)).toBeNull();
		expect(verificarCodigoTotp(SECRETO_RFC, "abcdef", 59_000)).toBeNull();
		expect(verificarCodigoTotp(SECRETO_RFC, "000000", 59_000)).toBeNull();
	});

	it("un secreto nuevo es base32 de 160 bits y verifica su propio código", () => {
		const secreto = generarSecretoTotp();
		expect(secreto).toMatch(/^[A-Z2-7]{32}$/);
		expect(
			verificarCodigoTotp(secreto, generarCodigoTotp(secreto)),
		).not.toBeNull();
	});

	it("la URI otpauth lleva emisor, cuenta y secreto", () => {
		const uri = uriOtpauth("ABC", "ana@x.com", "Hexacore");
		expect(uri).toStartWith("otpauth://totp/Hexacore%3Aana%40x.com?");
		expect(new URL(uri).searchParams.get("secret")).toBe("ABC");
		expect(new URL(uri).searchParams.get("issuer")).toBe("Hexacore");
	});

	it("los códigos de recuperación son únicos y su hash ignora formato y mayúsculas", () => {
		const codigos = generarCodigosRecuperacion();
		expect(codigos).toHaveLength(10);
		expect(new Set(codigos).size).toBe(10);
		const [codigo = ""] = codigos;
		expect(codigo).toMatch(/^[A-Z2-7]{5}-[A-Z2-7]{5}$/);
		expect(
			hashearCodigoRecuperacion(codigo.toLowerCase().replace("-", " ")),
		).toBe(hashearCodigoRecuperacion(codigo));
	});
});
