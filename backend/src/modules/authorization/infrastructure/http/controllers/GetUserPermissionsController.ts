import { injectable } from "tsyringe";
import type { Context } from "hono";
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

  run = async (c: Context): Promise<Response> => {
    return this.executeSafely(c, async () => {
      const { userId } = validate(userIdParamSchema, { userId: c.req.param("userId") });
      const result = await this.getUserPermissionsUseCase.run(userId);
      return this.ok(c, result);
    });
  };
}
