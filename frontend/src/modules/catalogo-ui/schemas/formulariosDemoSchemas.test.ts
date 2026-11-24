import { describe, expect, it } from "vitest";
import {
	asistenteCompletoSchema,
	pasoCuentaSchema,
	pasoPerfilSchema,
	validarPasoAsistente,
} from "./formulariosDemoSchemas";

describe("formulariosDemoSchemas", () => {
	it("valida correctamente el paso 1 y devuelve campos únicos al fallar", () => {
		const valido = validarPasoAsistente(pasoCuentaSchema, {
			nombre: "Ana López",
			email: "ana@ejemplo.com",
			password: "secreto-seguro",
		});
		expect(valido).toEqual({ valido: true, camposConError: [] });

		const invalido = validarPasoAsistente(pasoCuentaSchema, {
			nombre: "A",
			email: "invalido",
			password: "123",
		});
		expect(invalido.valido).toBe(false);
		expect(invalido.camposConError).toEqual(["nombre", "email", "password"]);
	});

	it("valida el paso 2 y el esquema completo extendido", () => {
		expect(
			validarPasoAsistente(pasoPerfilSchema, {
				rol: "admin",
				equipo: "",
				recibirResumen: true,
			}),
		).toEqual({ valido: false, camposConError: ["equipo"] });

		const completo = asistenteCompletoSchema.safeParse({
			nombre: "Ana López",
			email: "ana@ejemplo.com",
			password: "secreto-seguro",
			rol: "editor",
			equipo: "Producto",
			recibirResumen: false,
		});
		expect(completo.success).toBe(true);
	});
});
