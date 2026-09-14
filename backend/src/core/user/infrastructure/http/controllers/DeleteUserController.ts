import { injectable } from "tsyringe";
import type { Context } from "hono";
import { DeleteUserUseCase } from "../../../application/useCases/DeleteUserUseCase";
import { userIdSchema } from "../schemas/userSchemas";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";

@injectable()
export class DeleteUserController extends BaseController {
  constructor(private readonly deleteUserUseCase: DeleteUserUseCase) {
    super();
  }

  run = async (c: Context): Promise<Response> => {
    return this.executeSafely(c, async () => {
      const { id } = validate(userIdSchema, c.req.param());
      await this.deleteUserUseCase.run(id);
      return c.body(null, 204);
    });
  };
}
