import { beforeEach, describe, expect, it, mock } from "bun:test";
import { Usuario } from "@/core/usuario";
import type { PerfilOAuth } from "../../domain/service/ProveedorOAuth";
import { EmisorSesion } from "../services/EmisorSesion";
import { AutenticarOAuthUseCase } from "./AutenticarOAuthUseCase";
import { CanjearOAuthUseCase } from "./CanjearOAuthUseCase";
import { VincularOAuthUseCase } from "./VincularOAuthUseCase";

const usuario = (id: number, isActivo = true) =>
	Usuario.reconstituir("Ana", "ana@x.com", "hash", isActivo, id, ["USUARIO"]);

const perfil = (cambios: Partial<PerfilOAuth> = {}): PerfilOAuth => ({
	idExterno: "ext-1",
	nombre: "Ana",
	email: "ana@x.com",
	emailVerificado: true,
	...cambios,
});

const usuarios = {
	buscarPorEmail: mock(async (): Promise<Usuario | null> => null),
	buscarPorId: mock(async (): Promise<Usuario | null> => usuario(7)),
	crear: mock(async (u: Usuario) =>
		Usuario.reconstituir(u.getNombre(), u.getEmail(), "h", true, 9, []),
	),
};
const cuentasOAuth = {
	buscarUsuarioId: mock(async (): Promise<number | null> => null),
	vincular: mock(async () => {}),
};
const cuentaRepo = {
	crearToken: mock(async () => {}),
	consumirToken: mock(async (): Promise<number | null> => 7),
	marcarEmailVerificado: mock(async () => {}),
	bloqueadoHasta: mock(async (): Promise<Date | null> => null),
};
const dosFactores = {
	obtener: mock(async () => ({ activadoEn: null as Date | null })),
};
const tokenService = {
	generarToken: mock(() => "access"),
	generarRefreshToken: mock(() => "aleatorio"),
	hashearRefreshToken: mock((t: string) => `hash(${t})`),
	generarTokenDosPasos: mock(() => "token_2fa"),
};
const hasher = { hash: mock(async () => "password_hash") };
const uow = { ejecutar: <T>(trabajo: () => Promise<T>) => trabajo() };

beforeEach(() => {
	for (const repo of [usuarios, cuentasOAuth, cuentaRepo, dosFactores]) {
		for (const fn of Object.values(repo)) fn.mockClear();
	}
	cuentasOAuth.buscarUsuarioId.mockResolvedValue(null);
	usuarios.buscarPorEmail.mockResolvedValue(null);
	usuarios.buscarPorId.mockResolvedValue(usuario(7));
	cuentaRepo.consumirToken.mockResolvedValue(7);
	dosFactores.obtener.mockResolvedValue({ activadoEn: null });
});

describe("AutenticarOAuthUseCase", () => {
	const useCase = new AutenticarOAuthUseCase(
		usuarios as never,
		hasher as never,
		cuentasOAuth as never,
		cuentaRepo as never,
		tokenService as never,
		uow,
	);

	it("con la cuenta ya vinculada emite el código para ese usuario sin crear nada", async () => {
		cuentasOAuth.buscarUsuarioId.mockResolvedValue(3);

		expect(await useCase.ejecutar("google", perfil())).toBe("aleatorio");
		expect(cuentaRepo.crearToken).toHaveBeenCalledWith(
			expect.objectContaining({
				usuarioId: 3,
				tipo: "oauth_login",
				tokenHash: "hash(aleatorio)",
			}),
		);
		expect(cuentasOAuth.vincular).not.toHaveBeenCalled();
		expect(usuarios.crear).not.toHaveBeenCalled();
	});

	it("vincula al usuario existente con el mismo email verificado", async () => {
		usuarios.buscarPorEmail.mockResolvedValue(usuario(5));

		await useCase.ejecutar("github", perfil());

		expect(usuarios.crear).not.toHaveBeenCalled();
		expect(cuentasOAuth.vincular).toHaveBeenCalledWith({
			usuarioId: 5,
			proveedor: "github",
			idExterno: "ext-1",
			email: "ana@x.com",
		});
	});

	it("da de alta un usuario nuevo con el email ya verificado", async () => {
		await useCase.ejecutar("google", perfil());

		expect(usuarios.crear).toHaveBeenCalledTimes(1);
		expect(cuentaRepo.marcarEmailVerificado).toHaveBeenCalledWith(9);
		expect(cuentasOAuth.vincular).toHaveBeenCalledWith(
			expect.objectContaining({ usuarioId: 9 }),
		);
	});

	it.each([
		{ email: "ana@x.com", emailVerificado: false },
		{ email: null, emailVerificado: false },
	])("rechaza un perfil sin email verificado (%o)", async (cambios) => {
		await expect(useCase.ejecutar("github", perfil(cambios))).rejects.toThrow(
			"no tiene un email verificado",
		);
		expect(usuarios.buscarPorEmail).not.toHaveBeenCalled();
		expect(cuentaRepo.crearToken).not.toHaveBeenCalled();
	});

	it("rechaza el alta de un usuario nuevo con 403 si el registro público está cerrado", async () => {
		const ajustesCerrados = {
			obtener: mock(async () => ({ registroPublicoAbierto: false })),
			invalidar: mock(),
		};
		const cerrado = new AutenticarOAuthUseCase(
			usuarios as never,
			hasher as never,
			cuentasOAuth as never,
			cuentaRepo as never,
			tokenService as never,
			uow,
			ajustesCerrados as never,
		);

		await expect(cerrado.ejecutar("google", perfil())).rejects.toMatchObject({
			code: 403,
			message: "El registro público está desactivado",
		});
		expect(usuarios.crear).not.toHaveBeenCalled();

		// Un usuario ya existente sí puede iniciar sesión con OAuth
		cuentasOAuth.buscarUsuarioId.mockResolvedValue(3);
		expect(await cerrado.ejecutar("google", perfil())).toBe("aleatorio");
	});
});

describe("CanjearOAuthUseCase", () => {
	const refreshTokenRepo = { crear: mock(async () => {}) };
	const useCase = new CanjearOAuthUseCase(
		tokenService as never,
		cuentaRepo as never,
		usuarios as never,
		dosFactores as never,
		new EmisorSesion(tokenService as never, refreshTokenRepo as never),
	);

	it("canjea el código por la sesión", async () => {
		const resultado = await useCase.ejecutar("codigo");

		expect(cuentaRepo.consumirToken).toHaveBeenCalledWith(
			"hash(codigo)",
			"oauth_login",
		);
		expect(resultado).toMatchObject({
			accessToken: "access",
			usuario: { id: 7 },
		});
	});

	it("con 2FA activo pide el segundo factor en lugar de abrir sesión", async () => {
		dosFactores.obtener.mockResolvedValue({ activadoEn: new Date() });

		expect(await useCase.ejecutar("codigo")).toEqual({
			requiere2fa: true,
			token2fa: "token_2fa",
		});
	});

	it("rechaza un código inválido, caducado o ya usado", async () => {
		cuentaRepo.consumirToken.mockResolvedValue(null);
		await expect(useCase.ejecutar("codigo")).rejects.toMatchObject({
			code: 400,
		});
	});

	it("rechaza a un usuario inactivo", async () => {
		usuarios.buscarPorId.mockResolvedValue(usuario(7, false));
		await expect(useCase.ejecutar("codigo")).rejects.toMatchObject({
			code: 403,
		});
	});
});

describe("VincularOAuthUseCase", () => {
	const useCase = new VincularOAuthUseCase(cuentasOAuth as never);

	it("vincula una cuenta libre", async () => {
		await useCase.ejecutar(7, "google", perfil());
		expect(cuentasOAuth.vincular).toHaveBeenCalledWith(
			expect.objectContaining({ usuarioId: 7, proveedor: "google" }),
		);
	});

	it("no hace nada si ya estaba vinculada al mismo usuario", async () => {
		cuentasOAuth.buscarUsuarioId.mockResolvedValue(7);
		await useCase.ejecutar(7, "google", perfil());
		expect(cuentasOAuth.vincular).not.toHaveBeenCalled();
	});

	it("rechaza una cuenta vinculada a otro usuario", async () => {
		cuentasOAuth.buscarUsuarioId.mockResolvedValue(8);
		await expect(useCase.ejecutar(7, "google", perfil())).rejects.toMatchObject(
			{ code: 409 },
		);
	});
});
