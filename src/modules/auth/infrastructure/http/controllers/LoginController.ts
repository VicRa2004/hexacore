import type { Request, Response } from "express";
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

  run(req: Request, res: Response): Promise<void> {
    return this.executeSafely(async () => {
      const dto = validate(loginSchema, req.body);
      const result = await this.loginUseCase.run(dto);

      this.ok(res, result);
    }, res);
  }
}
