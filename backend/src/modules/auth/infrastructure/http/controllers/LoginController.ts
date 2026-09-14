import type { Context } from "hono";
import { injectable, inject } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { LoginUseCase } from "../../../application/useCases/LoginUseCase";

import { validate } from "@/core/shared/infrastructure/libs/validate";
import { loginSchema } from "../schemas/authSchemas";

@injectable()
export class LoginController extends BaseController {
  constructor(
    @inject(LoginUseCase) private readonly loginUseCase: LoginUseCase,
  ) {
    super();
  }

  run = async (c: Context): Promise<Response> => {
    return this.executeSafely(c, async () => {
      const body = await c.req.json();
      const dto = validate(loginSchema, body);
      const result = await this.loginUseCase.run(dto);

      return this.ok(c, result);
    });
  };
}
