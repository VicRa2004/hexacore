import { injectable } from "tsyringe";
import { Request, Response } from "express";
import { GetUserPermissionsUseCase } from "../../../application/useCases/GetUserPermissionsUseCase";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import { userIdParamSchema } from "../schemas/permissionSchemas";

@injectable()
export class GetUserPermissionsController extends BaseController {
  constructor(
    private readonly getUserPermissionsUseCase: GetUserPermissionsUseCase,
  ) {
    super();
  }

  run(req: Request, res: Response): Promise<void> {
    return this.executeSafely(async () => {
      const { userId } = validate(userIdParamSchema, req.params);
      const result = await this.getUserPermissionsUseCase.run(userId);
      this.ok(res, result);
    }, res);
  }
}
