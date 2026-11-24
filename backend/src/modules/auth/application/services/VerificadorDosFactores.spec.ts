import { beforeEach, describe, expect, it, mock } from "bun:test";
import { generarCodigoTotp, hashearCodigoRecuperacion } from "./totp";
import { VerificadorDosFactores } from "./VerificadorDosFactores";

const SECRETO = "JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP";
// Cifrador identidad: el cifrado real tiene su propio spec.
const cifrador = { cifrar: (t: string) => t, descifrar: (t: string) => t };

const repo = {
	obtener: mock(async () => ({
		secretoCifrado: SECRETO as string | null,
		activadoEn: new Date() as Date | null,
	})),
	registrarPaso: mock(async () => true),
	consumirCodigo: mock(async () => false),
};
const cuentaRepo = {
	bloqueadoHasta: mock(async (): Promise<Date | null> => null),
	registrarFallo: mock(async () => {}),
	reiniciarFallos: mock(async () => {}),
};

describe("VerificadorDosFactores", () => {
	let verificador: VerificadorDosFactores;

	beforeEach(() => {
		for (const m of [...Object.values(repo), ...Object.values(cuentaRepo)]) {
			m.mockClear();
		}
		verificador = new VerificadorDosFactores(
			repo as never,
			cifrador,
			cuentaRepo as never,
		);
	});

	it("acepta el código TOTP actual, lo marca como usado y reinicia los fallos", async () => {
		await verificador.verificar(7, generarCodigoTotp(SECRETO), 401);

		expect(repo.registrarPaso).toHaveBeenCalledTimes(1);
		expect(cuentaRepo.reiniciarFallos).toHaveBeenCalledWith(7);
	});

	it("rechaza un código TOTP ya usado (replay) y cuenta el fallo", async () => {
		repo.registrarPaso.mockResolvedValueOnce(false);

		await expect(
			verificador.verificar(7, generarCodigoTotp(SECRETO), 401),
		).rejects.toMatchObject({ code: 401 });
		expect(cuentaRepo.registrarFallo).toHaveBeenCalledWith(7, {
			maxIntentos: 5,
			bloqueoMs: 15 * 60 * 1000,
		});
	});

	it("acepta un código de recuperación normalizado y lo consume", async () => {
		repo.consumirCodigo.mockResolvedValueOnce(true);

		await verificador.verificar(7, "abcde fghij", 400);

		expect(repo.consumirCodigo).toHaveBeenCalledWith(
			7,
			hashearCodigoRecuperacion("ABCDE-FGHIJ"),
		);
		expect(repo.registrarPaso).not.toHaveBeenCalled();
	});

	it("con un código incorrecto lanza el status pedido y registra el fallo", async () => {
		await expect(
			verificador.verificar(7, "ABCDE-FGHIJ", 400),
		).rejects.toMatchObject({ code: 400 });
		expect(cuentaRepo.registrarFallo).toHaveBeenCalledTimes(1);
		expect(cuentaRepo.reiniciarFallos).not.toHaveBeenCalled();
	});

	it("con la cuenta bloqueada responde 429 sin comprobar el código", async () => {
		cuentaRepo.bloqueadoHasta.mockResolvedValueOnce(
			new Date(Date.now() + 1000),
		);

		await expect(
			verificador.verificar(7, generarCodigoTotp(SECRETO), 401),
		).rejects.toMatchObject({ code: 429 });
		expect(repo.registrarPaso).not.toHaveBeenCalled();
	});

	it("rechaza si el 2FA no está activo (alta pendiente)", async () => {
		repo.obtener.mockResolvedValueOnce({
			secretoCifrado: SECRETO,
			activadoEn: null,
		});

		await expect(
			verificador.verificar(7, generarCodigoTotp(SECRETO), 401),
		).rejects.toMatchObject({ code: 400 });
	});
});
