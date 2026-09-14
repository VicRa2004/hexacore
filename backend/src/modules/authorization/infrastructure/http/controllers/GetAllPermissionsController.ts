import { injectable } from "tsyringe";
import type { Context } from "hono";
import { GetAllPermissionsUseCase } from "../../../application/useCases/GetAllPermissionsUseCase";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";

@injectable()
export class GetAllPermissionsController extends BaseController {
  constructor(private readonly getAllPermissionsUseCase: GetAllPermissionsUseCase) {
    super();
  }

  run = async (c: Context): Promise<Response> => {
    return this.executeSafely(c, async () => {
      const result = await this.getAllPermissionsUseCase.run();
      return this.ok(c, result);
    });
  };
}
