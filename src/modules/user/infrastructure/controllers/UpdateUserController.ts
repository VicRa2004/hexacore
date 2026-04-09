import { injectable } from "tsyringe";
import { Request, Response } from "express";
import { UpdateUserUseCase } from "../../application/useCases/UpdateUserUseCase";
import { userIdSchema, updateUserSchema } from "../schemas/userSchemas";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";

@injectable()
export class UpdateUserController extends BaseController {
  constructor(private readonly updateUserUseCase: UpdateUserUseCase) {
    super();
  }

  run(req: Request, res: Response): Promise<void> {
    return this.executeSafely(async () => {
      const { id } = validate(userIdSchema, req.params);
      const dto = validate(updateUserSchema, req.body);
      const result = await this.updateUserUseCase.run(id, dto);
      this.ok(res, result);
    }, res);
  }
}
