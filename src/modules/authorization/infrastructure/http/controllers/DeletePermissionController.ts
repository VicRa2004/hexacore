import { injectable } from "tsyringe";
import { Request, Response } from "express";
import { DeletePermissionUseCase } from "../../../application/useCases/DeletePermissionUseCase";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import { permissionIdSchema } from "../schemas/permissionSchemas";

@injectable()
export class DeletePermissionController extends BaseController {
  constructor(private readonly deletePermissionUseCase: DeletePermissionUseCase) {
    super();
  }

  run(req: Request, res: Response): Promise<void> {
    return this.executeSafely(async () => {
      const { id } = validate(permissionIdSchema, req.params);
      await this.deletePermissionUseCase.run(id);
      res.status(204).send();
    }, res);
  }
}
