import { injectable } from "tsyringe";
import type { Context } from "hono";
import { GetAllUsersUseCase } from "../../../application/useCases/GetAllUsersUseCase";
import { getAllUsersSchema } from "../schemas/userSchemas";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";

@injectable()
export class GetAllUsersController extends BaseController {
  constructor(private readonly getAllUsersUseCase: GetAllUsersUseCase) {
    super();
  }

  run = async (c: Context): Promise<Response> => {
    return this.executeSafely(c, async () => {
      const dto = validate(getAllUsersSchema, c.req.query());
      const result = await this.getAllUsersUseCase.run(dto);
      return this.ok(c, result);
    });
  };
}
