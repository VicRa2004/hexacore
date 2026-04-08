import { Request, Response } from "express";
import { DeleteUserUseCase } from "../../application/useCases/DeleteUserUseCase";
import { userIdSchema } from "../schemas/userSchemas";
import { ZodError } from "zod";

export class DeleteUserController {
  constructor(private readonly deleteUserUseCase: DeleteUserUseCase) {}

  async run(req: Request, res: Response): Promise<void> {
    try {
      const { id } = userIdSchema.parse(req.params);
      await this.deleteUserUseCase.run(id);
      res.status(204).send();
    } catch (error: any) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: "Error de validación", details: error.errors });
      } else if (error.statusCode) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message || "Internal server error" });
      }
    }
  }
}
