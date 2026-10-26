import type { Context } from "hono";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { RegisterUseCase } from "../../../application/useCases/RegisterUseCase";

import { validate } from "@/core/shared/infrastructure/libs/validate";
import { setRefreshTokenCookie } from "../refreshTokenCookie";
import { registerSchema } from "../schemas/authSchemas";

export class RegisterController extends BaseController {
	constructor(private readonly registerUseCase: RegisterUseCase) {
		super();
	}

	run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const body = await c.req.json();
			const dto = validate(registerSchema, body);
			const { refreshToken, ...session } = await this.registerUseCase.run(dto);

			setRefreshTokenCookie(c, refreshToken);
			return this.created(c, session);
		});
	};
}
