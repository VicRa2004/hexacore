import { injectable } from "tsyringe";
import type { Context } from "hono";
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

  run = async (c: Context): Promise<Response> => {
    return this.executeSafely(c, async () => {
      const { id } = validate(permissionIdSchema, c.req.param());
      const body = await c.req.json();
      const dto = validate(updatePermissionSchema, body);
      const result = await this.updatePermissionUseCase.run(id, dto);
      return this.ok(c, result);
    });
  };
}
