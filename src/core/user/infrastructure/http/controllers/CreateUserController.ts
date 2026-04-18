import { injectable } from "tsyringe";
import type { Context } from "hono";
import { CreateUserUseCase } from "../../../application/useCases/CreateUserUseCase";
import { createUserSchema } from "../schemas/userSchemas";
import { BaseController } from "@/core/shared/infrastructure/http/base.controller";
import { validate } from "@/core/shared/infrastructure/libs/validate";

@injectable()
export class CreateUserController extends BaseController {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {
    super();
  }

  run = async (c: Context): Promise<Response> => {
    return this.executeSafely(c, async () => {
      const body = await c.req.json();

      // validacion de datos
      const dto = validate(createUserSchema, body);

      // ejecucion del caso de uso
      const result = await this.createUserUseCase.run(dto);

      // respuesta
      return this.created(c, result);
    });
  };
}
