import type { Context } from "hono";
import { injectable, inject } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { LogoutUseCase } from "../../../application/useCases/LogoutUseCase";

import { validate } from "@/core/shared/infrastructure/libs/validate";
import { refreshTokenSchema } from "../schemas/authSchemas";

@injectable()
export class LogoutController extends BaseController {
	constructor(
		@inject(LogoutUseCase)
		private readonly logoutUseCase: LogoutUseCase,
	) {
		super();
	}

	run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const body = await c.req.json();
			const dto = validate(refreshTokenSchema, body);
			await this.logoutUseCase.run(dto.refreshToken);

			return this.ok(c, { message: "Sesión cerrada correctamente" });
		});
	};
}
