import { injectable } from "tsyringe";
import type { Context } from "hono";
import { UpdateUserUseCase } from "../../../application/useCases/UpdateUserUseCase";
import { userIdSchema, updateUserSchema } from "../schemas/userSchemas";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";

@injectable()
export class UpdateUserController extends BaseController {
  constructor(private readonly updateUserUseCase: UpdateUserUseCase) {
    super();
  }

  run = async (c: Context): Promise<Response> => {
    return this.executeSafely(c, async () => {
      const { id } = validate(userIdSchema, c.req.param());
      const body = await c.req.json();
      const dto = validate(updateUserSchema, body);
      const result = await this.updateUserUseCase.run(id, dto);
      return this.ok(c, result);
    });
  };
}
