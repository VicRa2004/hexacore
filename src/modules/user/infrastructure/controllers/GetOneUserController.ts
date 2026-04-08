import { Request, Response } from "express";
import { GetOneUserUseCase } from "../../application/useCases/GetOneUserUseCase";
import { userIdSchema } from "../schemas/userSchemas";
import { ZodError } from "zod";

export class GetOneUserController {
  constructor(private readonly getOneUserUseCase: GetOneUserUseCase) {}

  async run(req: Request, res: Response): Promise<void> {
    try {
      const { id } = userIdSchema.parse(req.params);
      const dto = { id };
      const result = await this.getOneUserUseCase.run(dto);
      
      res.status(200).json(result);
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
