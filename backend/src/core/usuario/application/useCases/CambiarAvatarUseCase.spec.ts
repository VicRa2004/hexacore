import { beforeEach, describe, expect, it, mock } from "bun:test";
import { Usuario } from "../../domain/Usuario";
import { AvatarInvalidoError } from "../../domain/error/AvatarInvalidoError";
import { CambiarAvatarUseCase } from "./CambiarAvatarUseCase";

const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0]);

const usuarioConAvatar = (avatar: string | null) =>
	Usuario.reconstituir(
		"Ana",
		"ana@test.com",
		"hash",
		true,
		1,
		["USUARIO"],
		true,
		avatar,
	);

const repo = { buscarPorId: mock(), actualizar: mock() };
const almacenamiento = { guardar: mock(), obtener: mock(), eliminar: mock() };

describe("CambiarAvatarUseCase", () => {
	let useCase: CambiarAvatarUseCase;

	beforeEach(() => {
		for (const m of [...Object.values(repo), ...Object.values(almacenamiento)])
			m.mockReset();
		repo.actualizar.mockImplementation(async (u: Usuario) => u);
		useCase = new CambiarAvatarUseCase(
			repo as never,
			almacenamiento as never,
			{ publishAll: mock(async () => {}) } as never,
			{ ejecutar: (trabajo: () => Promise<unknown>) => trabajo() } as never,
		);
	});

	it("debería guardar el PNG con clave nueva y borrar el anterior", async () => {
		repo.buscarPorId.mockResolvedValue(
			usuarioConAvatar("avatares/1-viejo.png"),
		);

		const dto = await useCase.ejecutar(1, PNG);

		const [clave, , tipo] = almacenamiento.guardar.mock.calls[0] ?? [];
		expect(clave).toMatch(/^avatares\/1-[\w-]+\.png$/);
		expect(tipo).toBe("image/png");
		expect(almacenamiento.eliminar).toHaveBeenCalledWith(
			"avatares/1-viejo.png",
		);
		expect(dto.avatarUrl).toContain(encodeURIComponent(clave));
	});

	it("debería rechazar un archivo que no es imagen aunque diga serlo", async () => {
		repo.buscarPorId.mockResolvedValue(usuarioConAvatar(null));

		await expect(
			useCase.ejecutar(1, new TextEncoder().encode("<svg/>")),
		).rejects.toBeInstanceOf(AvatarInvalidoError);
		expect(almacenamiento.guardar).not.toHaveBeenCalled();
	});

	it("debería borrar el archivo nuevo si falla la escritura en BD", async () => {
		repo.buscarPorId.mockResolvedValue(usuarioConAvatar(null));
		repo.actualizar.mockRejectedValue(new Error("db caída"));

		await expect(useCase.ejecutar(1, PNG)).rejects.toThrow("db caída");
		const [clave] = almacenamiento.guardar.mock.calls[0] ?? [];
		expect(almacenamiento.eliminar).toHaveBeenCalledWith(clave);
	});

	it("con null debería quitar el avatar y borrar el archivo", async () => {
		repo.buscarPorId.mockResolvedValue(
			usuarioConAvatar("avatares/1-viejo.png"),
		);

		const dto = await useCase.ejecutar(1, null);

		expect(dto.avatarUrl).toBeNull();
		expect(almacenamiento.eliminar).toHaveBeenCalledWith(
			"avatares/1-viejo.png",
		);
	});
});
