import type { Context } from "hono";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { RefreshTokenUseCase } from "../../../application/useCases/RefreshTokenUseCase";

import { validate } from "@/core/shared/infrastructure/libs/validate";
import {
	getRefreshTokenCookie,
	setRefreshTokenCookie,
} from "../refreshTokenCookie";
import { refreshTokenSchema } from "../schemas/authSchemas";

export class RefreshTokenController extends BaseController {
	constructor(private readonly refreshTokenUseCase: RefreshTokenUseCase) {
		super();
	}

	run = async (c: Context): Promise<Response> => {
		return this.executeSafely(c, async () => {
			const dto = validate(refreshTokenSchema, {
				refreshToken: getRefreshTokenCookie(c),
			});
			const { refreshToken, accessToken } = await this.refreshTokenUseCase.run(
				dto.refreshToken,
			);

			setRefreshTokenCookie(c, refreshToken);
			return this.ok(c, { accessToken });
		});
	};
}
