import { injectable } from "tsyringe";
import type { Context } from "hono";
import { GetPermissionUseCase } from "../../../application/useCases/GetPermissionUseCase";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import { permissionIdSchema } from "../schemas/permissionSchemas";

@injectable()
export class GetPermissionController extends BaseController {
  constructor(private readonly getPermissionUseCase: GetPermissionUseCase) {
    super();
  }

  run = async (c: Context): Promise<Response> => {
    return this.executeSafely(c, async () => {
      const { id } = validate(permissionIdSchema, c.req.param());
      const result = await this.getPermissionUseCase.run(id);
      return this.ok(c, result);
    });
  };
}
