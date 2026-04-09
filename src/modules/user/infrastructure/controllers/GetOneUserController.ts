import { injectable } from "tsyringe";
import { Request, Response } from "express";
import { GetOneUserUseCase } from "../../application/useCases/GetOneUserUseCase";
import { userIdSchema } from "../schemas/userSchemas";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";

@injectable()
export class GetOneUserController extends BaseController {
  constructor(private readonly getOneUserUseCase: GetOneUserUseCase) {
    super();
  }

  run(req: Request, res: Response): Promise<void> {
    return this.executeSafely(async () => {
      const { id } = validate(userIdSchema, req.params);

      const result = await this.getOneUserUseCase.run({ id });

      this.ok(res, result);
    }, res);
  }
}
