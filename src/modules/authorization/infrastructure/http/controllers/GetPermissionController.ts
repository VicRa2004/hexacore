import { injectable } from "tsyringe";
import { Request, Response } from "express";
import { GetPermissionUseCase } from "../../../application/useCases/GetPermissionUseCase";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import { permissionIdSchema } from "../schemas/permissionSchemas";

@injectable()
export class GetPermissionController extends BaseController {
  constructor(private readonly getPermissionUseCase: GetPermissionUseCase) {
    super();
  }

  run(req: Request, res: Response): Promise<void> {
    return this.executeSafely(async () => {
      const { id } = validate(permissionIdSchema, req.params);
      const result = await this.getPermissionUseCase.run(id);
      this.ok(res, result);
    }, res);
  }
}
