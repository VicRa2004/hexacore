import { injectable } from "tsyringe";
import type { Context } from "hono";
import { DeletePermissionUseCase } from "../../../application/useCases/DeletePermissionUseCase";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import { permissionIdSchema } from "../schemas/permissionSchemas";

@injectable()
export class DeletePermissionController extends BaseController {
  constructor(private readonly deletePermissionUseCase: DeletePermissionUseCase) {
    super();
  }

  run = async (c: Context): Promise<Response> => {
    return this.executeSafely(c, async () => {
      const { id } = validate(permissionIdSchema, c.req.param());
      await this.deletePermissionUseCase.run(id);
      return c.body(null, 204);
    });
  };
}
