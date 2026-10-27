import { describe, expect, it } from "bun:test";
import { UsuarioMapper } from "./UsuarioMapper";
import { Usuario } from "../../domain/Usuario";

describe("UsuarioMapper", () => {
	it("debería mapear una entidad Usuario a un UsuarioDto correctamente", () => {
		const usuario = Usuario.reconstituir(
			"Jane Doe",
			"jane@example.com",
			"hash",
			true,
			456,
			["ADMIN", "USUARIO"],
		);

		const dto = UsuarioMapper.toDto(usuario);

		expect(dto.id).toBe(456);
		expect(dto.nombre).toBe("Jane Doe");
		expect(dto.email).toBe("jane@example.com");
		expect(dto.isActivo).toBe(true);
		expect(dto.roles).toEqual(["ADMIN", "USUARIO"]);
		// Verificamos que no incluya password u otros campos sensibles si existieran
		expect(dto).not.toHaveProperty("passwordHash");
	});
});
