import { Request, Response } from "express";
import { DeleteUserUseCase } from "../../application/useCases/DeleteUserUseCase";
import { userIdSchema } from "../schemas/userSchemas";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";

export class DeleteUserController extends BaseController {
  constructor(private readonly deleteUserUseCase: DeleteUserUseCase) {
    super();
  }

  run(req: Request, res: Response): Promise<void> {
    return this.executeSafely(async () => {
      const { id } = validate(userIdSchema, req.params);
      await this.deleteUserUseCase.run(id);
      res.status(204).send();
    }, res);
  }
}
