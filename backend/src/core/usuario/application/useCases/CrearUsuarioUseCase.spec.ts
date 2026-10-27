import { describe, expect, it, mock, beforeEach } from "bun:test";
import { CrearUsuarioUseCase } from "./CrearUsuarioUseCase";
import { Usuario } from "../../domain/Usuario";
import { BaseError } from "@/core/shared/domain/error/BaseError";

// Mocks
const mockUsuarioRepository = {
	buscar: mock(),
	buscarPorEmail: mock(),
	crear: mock(),
	buscarPorId: mock(),
	actualizar: mock(),
	eliminar: mock(),
};

const mockPasswordHasher = {
	hash: mock(),
	comparar: mock(),
};

const mockEventBus = {
	publish: mock(),
	publishAll: mock(),
};

describe("CrearUsuarioUseCase", () => {
	let useCase: CrearUsuarioUseCase;

	beforeEach(() => {
		mockUsuarioRepository.buscarPorEmail.mockClear();
		mockUsuarioRepository.crear.mockClear();
		mockPasswordHasher.hash.mockClear();
		mockEventBus.publishAll.mockClear();

		useCase = new CrearUsuarioUseCase(
			mockUsuarioRepository as never,
			mockPasswordHasher as never,
			mockEventBus as never,
		);
	});

	it("debería crear un usuario exitosamente cuando los datos son válidos y el email no existe", async () => {
		// Arrange
		const dto = {
			id: 123,
			nombre: "Test Usuario",
			email: "test@example.com",
			password: "securePassword123",
			roles: ["USUARIO"],
			isActivo: true,
		};

		mockUsuarioRepository.buscarPorEmail.mockResolvedValue(null);
		mockPasswordHasher.hash.mockResolvedValue("hashed_password");

		const usuarioFalso = Usuario.reconstituir(
			dto.nombre,
			dto.email,
			"hashed_password",
			dto.isActivo,
			dto.id,
			dto.roles,
		);
		mockUsuarioRepository.crear.mockResolvedValue(usuarioFalso);

		// Act
		const resultado = await useCase.ejecutar(dto);

		// Assert
		expect(mockUsuarioRepository.buscarPorEmail).toHaveBeenCalledWith(
			dto.email,
		);
		expect(mockPasswordHasher.hash).toHaveBeenCalledWith(dto.password);
		expect(mockUsuarioRepository.crear).toHaveBeenCalled();
		expect(mockEventBus.publishAll).toHaveBeenCalled();
		expect(resultado.email).toBe(dto.email);
		expect(resultado.nombre).toBe(dto.nombre);
	});

	it("debería lanzar BaseError (400) si el usuario ya existe", async () => {
		// Arrange
		const dto = {
			nombre: "Test Usuario",
			email: "existente@example.com",
			password: "password",
		};

		const usuarioExistente = Usuario.crear("Existing", dto.email, "hash");
		mockUsuarioRepository.buscarPorEmail.mockResolvedValue(usuarioExistente);

		// Act & Assert
		expect(useCase.ejecutar(dto)).rejects.toThrow(BaseError);
		expect(useCase.ejecutar(dto)).rejects.toThrow(
			"Ya existe un usuario con ese email",
		);
		expect(mockUsuarioRepository.crear).not.toHaveBeenCalled();
	});
});
