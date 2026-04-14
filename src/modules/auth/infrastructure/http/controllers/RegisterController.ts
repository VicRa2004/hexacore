import { Request, Response } from "express";
import { injectable, inject } from "tsyringe";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { RegisterUseCase } from "../../../application/useCases/RegisterUseCase";

import { validate } from "@/core/shared/infrastructure/libs/validate";
import { registerSchema } from "../schemas/authSchemas";

@injectable()
export class RegisterController extends BaseController {
  constructor(
    @inject(RegisterUseCase) private readonly registerUseCase: RegisterUseCase,
  ) {
    super();
  }

  run(req: Request, res: Response): Promise<void> {
    return this.executeSafely(async () => {
      const dto = validate(registerSchema, req.body).body;
      const result = await this.registerUseCase.run(dto);

      this.created(res, result);
    }, res);
  }
}
