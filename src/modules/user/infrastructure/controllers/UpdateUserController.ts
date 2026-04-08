import { Request, Response } from "express";
import { UpdateUserUseCase } from "../../application/useCases/UpdateUserUseCase";
import { userIdSchema, updateUserSchema } from "../schemas/userSchemas";
import { ZodError } from "zod";

export class UpdateUserController {
  constructor(private readonly updateUserUseCase: UpdateUserUseCase) {}

  async run(req: Request, res: Response): Promise<void> {
    try {
      const { id } = userIdSchema.parse(req.params);
      const dto = updateUserSchema.parse(req.body);

      const result = await this.updateUserUseCase.run(id, dto);

      res.status(200).json(result);
    } catch (error: any) {
      if (error instanceof ZodError) {
        res
          .status(400)
          .json({ error: "Error de validación", details: error.format() });
      } else if (error.statusCode) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res
          .status(500)
          .json({ error: error.message || "Internal server error" });
      }
    }
  }
}
