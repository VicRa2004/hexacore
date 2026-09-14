import { injectable } from "tsyringe";
import type { Context } from "hono";
import { CreatePermissionUseCase } from "../../../application/useCases/CreatePermissionUseCase";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";
import { createPermissionSchema } from "../schemas/permissionSchemas";

@injectable()
export class CreatePermissionController extends BaseController {
  constructor(private readonly createPermissionUseCase: CreatePermissionUseCase) {
    super();
  }

  run = async (c: Context): Promise<Response> => {
    return this.executeSafely(c, async () => {
      const body = await c.req.json();
      const dto = validate(createPermissionSchema, body);
      const result = await this.createPermissionUseCase.run(dto);
      return this.created(c, result);
    });
  };
}
