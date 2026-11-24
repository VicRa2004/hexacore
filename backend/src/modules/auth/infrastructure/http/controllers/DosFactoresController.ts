import type { Context } from "hono";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import type { ActivarDosFactoresUseCase } from "../../../application/useCases/ActivarDosFactoresUseCase";
import type { DesactivarDosFactoresUseCase } from "../../../application/useCases/DesactivarDosFactoresUseCase";
import type { IniciarDosFactoresUseCase } from "../../../application/useCases/IniciarDosFactoresUseCase";
import type { ObtenerDosFactoresUseCase } from "../../../application/useCases/ObtenerDosFactoresUseCase";
import type { RegenerarCodigosRecuperacionUseCase } from "../../../application/useCases/RegenerarCodigosRecuperacionUseCase";
import type { AuthEnv } from "../middlewares/authMiddleware";
import {
	codigoSchema,
	desactivarDosFactoresSchema,
} from "../schemas/authSchemas";

/** Verificación en dos pasos (TOTP) del usuario autenticado. */
export class DosFactoresController extends BaseController {
	constructor(
		private readonly useCases: {
			obtener: ObtenerDosFactoresUseCase;
			iniciar: IniciarDosFactoresUseCase;
			activar: ActivarDosFactoresUseCase;
			desactivar: DesactivarDosFactoresUseCase;
			regenerarCodigos: RegenerarCodigosRecuperacionUseCase;
		},
	) {
		super();
	}

	obtener = (c: Context<AuthEnv>): Promise<Response> =>
		this.executeSafely(c, async () =>
			this.ok(c, await this.useCases.obtener.ejecutar(c.get("usuario").id)),
		);

	iniciar = (c: Context<AuthEnv>): Promise<Response> =>
		this.executeSafely(c, async () =>
			this.ok(c, await this.useCases.iniciar.ejecutar(c.get("usuario").id)),
		);

	activar = (c: Context<AuthEnv>): Promise<Response> =>
		this.executeSafely(c, async () => {
			const { codigo } = validate(codigoSchema, await c.req.json());
			return this.ok(
				c,
				await this.useCases.activar.ejecutar(c.get("usuario").id, codigo),
			);
		});

	desactivar = (c: Context<AuthEnv>): Promise<Response> =>
		this.executeSafely(c, async () => {
			const dto = validate(desactivarDosFactoresSchema, await c.req.json());
			await this.useCases.desactivar.ejecutar(c.get("usuario").id, dto);
			return this.ok(c, { mensaje: "Verificación en dos pasos desactivada" });
		});

	regenerarCodigos = (c: Context<AuthEnv>): Promise<Response> =>
		this.executeSafely(c, async () => {
			const { codigo } = validate(codigoSchema, await c.req.json());
			return this.ok(
				c,
				await this.useCases.regenerarCodigos.ejecutar(
					c.get("usuario").id,
					codigo,
				),
			);
		});
}
