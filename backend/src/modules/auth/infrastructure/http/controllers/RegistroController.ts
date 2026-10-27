import type { Context } from "hono";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { RegistroUseCase } from "../../../application/useCases/RegistroUseCase";

import { validate } from "@/core/shared/infrastructure/libs/validate";
import { setRefreshTokenCookie } from "../refreshTokenCookie";
import { registroSchema } from "../schemas/authSchemas";

export class RegistroController extends BaseController {
	constructor(private readonly registroUseCase: RegistroUseCase) {
		super();
	}

	ejecutar = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const body = await c.req.json();
			const dto = validate(registroSchema, body);
			const { refreshToken, ...session } =
				await this.registroUseCase.ejecutar(dto);

			setRefreshTokenCookie(c, refreshToken);
			return this.created(c, session);
		});
	};
}
