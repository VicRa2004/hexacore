import { injectable } from "tsyringe";
import { Request, Response } from "express";
import { GetAllUsersUseCase } from "../../../application/useCases/GetAllUsersUseCase";
import { getAllUsersSchema } from "../schemas/userSchemas";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";

@injectable()
export class GetAllUsersController extends BaseController {
  constructor(private readonly getAllUsersUseCase: GetAllUsersUseCase) {
    super();
  }

  run(req: Request, res: Response): Promise<void> {
    return this.executeSafely(async () => {
      const dto = validate(getAllUsersSchema, req.query);
      const result = await this.getAllUsersUseCase.run(dto);
      this.ok(res, result);
    }, res);
  }
}
