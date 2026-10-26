import type { Context } from "hono";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { LogoutUseCase } from "../../../application/useCases/LogoutUseCase";

import { validate } from "@/core/shared/infrastructure/libs/validate";
import {
	clearRefreshTokenCookie,
	getRefreshTokenCookie,
} from "../refreshTokenCookie";
import { refreshTokenSchema } from "../schemas/authSchemas";

export class LogoutController extends BaseController {
	constructor(private readonly logoutUseCase: LogoutUseCase) {
		super();
	}

	run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const dto = validate(refreshTokenSchema, {
				refreshToken: getRefreshTokenCookie(c),
			});
			clearRefreshTokenCookie(c);
			await this.logoutUseCase.run(dto.refreshToken);

			return this.ok(c, { message: "Sesión cerrada correctamente" });
		});
	};
}
