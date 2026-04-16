import { injectable } from "tsyringe";
import { Request, Response } from "express";
import { UpdatePermissionUseCase } from "../../../application/useCases/UpdatePermissionUseCase";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import {
  permissionIdSchema,
  updatePermissionSchema,
} from "../schemas/permissionSchemas";

@injectable()
export class UpdatePermissionController extends BaseController {
  constructor(private readonly updatePermissionUseCase: UpdatePermissionUseCase) {
    super();
  }

  run(req: Request, res: Response): Promise<void> {
    return this.executeSafely(async () => {
      const { id } = validate(permissionIdSchema, req.params);
      const dto = validate(updatePermissionSchema, req.body);
      const result = await this.updatePermissionUseCase.run(id, dto);
      this.ok(res, result);
    }, res);
  }
}
