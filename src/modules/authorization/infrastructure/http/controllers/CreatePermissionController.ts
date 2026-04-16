import { injectable } from "tsyringe";
import { Request, Response } from "express";
import { CreatePermissionUseCase } from "../../../application/useCases/CreatePermissionUseCase";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import { createPermissionSchema } from "../schemas/permissionSchemas";

@injectable()
export class CreatePermissionController extends BaseController {
  constructor(private readonly createPermissionUseCase: CreatePermissionUseCase) {
    super();
  }

  run(req: Request, res: Response): Promise<void> {
    return this.executeSafely(async () => {
      const dto = validate(createPermissionSchema, req.body);
      const result = await this.createPermissionUseCase.run(dto);
      this.created(res, result);
    }, res);
  }
}
