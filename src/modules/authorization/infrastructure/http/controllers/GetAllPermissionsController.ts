import { injectable } from "tsyringe";
import { Request, Response } from "express";
import { GetAllPermissionsUseCase } from "../../../application/useCases/GetAllPermissionsUseCase";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";

@injectable()
export class GetAllPermissionsController extends BaseController {
  constructor(private readonly getAllPermissionsUseCase: GetAllPermissionsUseCase) {
    super();
  }

  run(_req: Request, res: Response): Promise<void> {
    return this.executeSafely(async () => {
      const result = await this.getAllPermissionsUseCase.run();
      this.ok(res, result);
    }, res);
  }
}
