import { injectable } from "tsyringe";
import type { Context } from "hono";
import { GetOneUserUseCase } from "../../../application/useCases/GetOneUserUseCase";
import { userIdSchema } from "../schemas/userSchemas";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";

@injectable()
export class GetOneUserController extends BaseController {
  constructor(private readonly getOneUserUseCase: GetOneUserUseCase) {
    super();
  }

  run = async (c: Context): Promise<Response> => {
    return this.executeSafely(c, async () => {
      const { id } = validate(userIdSchema, c.req.param());

      const result = await this.getOneUserUseCase.run({ id });

      return this.ok(c, result);
    });
  };
}
