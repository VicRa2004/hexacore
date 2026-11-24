import type { Context } from "hono";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import type { LoginDosFactoresUseCase } from "../../../application/useCases/LoginDosFactoresUseCase";
import type { LoginUseCase } from "../../../application/useCases/LoginUseCase";

import { validate } from "@/core/shared/infrastructure/libs/validate";
import { setRefreshTokenCookie } from "../refreshTokenCookie";
import { loginDosFactoresSchema, loginSchema } from "../schemas/authSchemas";

export class LoginController extends BaseController {
	constructor(
		private readonly useCases: {
			login: LoginUseCase;
			loginDosFactores: LoginDosFactoresUseCase;
		},
	) {
		super();
	}

	login = (c: Context): Promise<Response> =>
		this.executeSafely(c, async () => {
			const dto = validate(loginSchema, await c.req.json());
			const resultado = await this.useCases.login.ejecutar(dto);
			// Con 2FA aún no hay sesión: solo el token intermedio.
			if ("requiere2fa" in resultado) return this.ok(c, resultado);

			const { refreshToken, ...session } = resultado;
			setRefreshTokenCookie(c, refreshToken);
			return this.ok(c, session);
		});

	dosFactores = (c: Context): Promise<Response> =>
		this.executeSafely(c, async () => {
			const dto = validate(loginDosFactoresSchema, await c.req.json());
			const { refreshToken, ...session } =
				await this.useCases.loginDosFactores.ejecutar(dto);

			setRefreshTokenCookie(c, refreshToken);
			return this.ok(c, session);
		});
}
