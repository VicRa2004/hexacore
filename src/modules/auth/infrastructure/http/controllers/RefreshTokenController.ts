import type { Context } from "hono";
import { injectable, inject } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { RefreshTokenUseCase } from "../../../application/useCases/RefreshTokenUseCase";

import { validate } from "@/core/shared/infrastructure/libs/validate";
import { refreshTokenSchema } from "../schemas/authSchemas";

@injectable()
export class RefreshTokenController extends BaseController {
  constructor(
    @inject(RefreshTokenUseCase)
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
  ) {
    super();
  }

  run = async (c: Context): Promise<Response> => {
    return this.executeSafely(c, async () => {
      const body = await c.req.json();
      const dto = validate(refreshTokenSchema, body);
      const result = await this.refreshTokenUseCase.run(dto.refreshToken);

      return this.ok(c, result);
    });
  };
}
