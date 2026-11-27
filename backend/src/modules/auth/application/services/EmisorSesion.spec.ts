import { beforeEach, describe, expect, it, mock } from "bun:test";
import { Usuario } from "@/core/usuario";
import { SesionIniciadaEvent } from "../../domain/event/SesionIniciadaEvent";
import { EmisorSesion } from "./EmisorSesion";

describe("EmisorSesion", () => {
	const usuario = Usuario.reconstituir(
		"Ana",
		"ana@test.dev",
		"hash",
		true,
		12,
		["USUARIO"],
	);

	const ordenLlamadas: string[] = [];

	const tokenService = {
		generarToken: mock(() => "access-token"),
		generarRefreshToken: mock(() => "refresh-token"),
		hashearRefreshToken: mock(() => "refresh-hash"),
	};

	const refreshTokenRepo = {
		esDispositivoNuevo: mock(async () => {
			ordenLlamadas.push("esDispositivoNuevo");
			return false;
		}),
		crear: mock(async () => {
			ordenLlamadas.push("crear");
		}),
	};

	const eventBus = {
		publish: mock(async () => {
			ordenLlamadas.push("publish");
		}),
		publishAll: mock(async () => {}),
		subscribe: mock(() => {}),
	};

	beforeEach(() => {
		ordenLlamadas.length = 0;
		refreshTokenRepo.esDispositivoNuevo.mockReset();
		refreshTokenRepo.crear.mockReset();
		eventBus.publish.mockReset();
		refreshTokenRepo.esDispositivoNuevo.mockImplementation(async () => {
			ordenLlamadas.push("esDispositivoNuevo");
			return false;
		});
		refreshTokenRepo.crear.mockImplementation(async () => {
			ordenLlamadas.push("crear");
		});
		eventBus.publish.mockImplementation(async () => {
			ordenLlamadas.push("publish");
		});
	});

	it("no publica SesionIniciadaEvent en el primer login o mismo dispositivo", async () => {
		const emisor = new EmisorSesion(
			tokenService as never,
			refreshTokenRepo as never,
			eventBus as never,
		);

		await emisor.emitir(usuario, "password");

		expect(refreshTokenRepo.esDispositivoNuevo).toHaveBeenCalledWith(12);
		expect(refreshTokenRepo.crear).toHaveBeenCalledTimes(1);
		expect(eventBus.publish).not.toHaveBeenCalled();
		expect(ordenLlamadas).toEqual(["esDispositivoNuevo", "crear"]);
	});

	it("comprueba esDispositivoNuevo antes de crear y publica si el dispositivo es nuevo", async () => {
		refreshTokenRepo.esDispositivoNuevo.mockImplementationOnce(async () => {
			ordenLlamadas.push("esDispositivoNuevo");
			return true;
		});

		const emisor = new EmisorSesion(
			tokenService as never,
			refreshTokenRepo as never,
			eventBus as never,
		);

		await emisor.emitir(usuario, "2fa");

		expect(ordenLlamadas).toEqual(["esDispositivoNuevo", "crear", "publish"]);
		const evento = eventBus.publish.mock.calls[0]?.[0] as SesionIniciadaEvent;
		expect(evento).toBeInstanceOf(SesionIniciadaEvent);
		expect(evento.data).toEqual({ usuarioId: 12, metodo: "2fa" });
	});

	it("no comprueba dispositivo ni publica cuando no se indica metodoLogin (refresh/registro)", async () => {
		const emisor = new EmisorSesion(
			tokenService as never,
			refreshTokenRepo as never,
			eventBus as never,
		);

		await emisor.emitir(usuario);

		expect(refreshTokenRepo.esDispositivoNuevo).not.toHaveBeenCalled();
		expect(refreshTokenRepo.crear).toHaveBeenCalledTimes(1);
		expect(eventBus.publish).not.toHaveBeenCalled();
	});
});
