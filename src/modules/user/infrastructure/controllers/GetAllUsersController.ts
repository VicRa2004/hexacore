import { Request, Response } from "express";
import { GetAllUsersUseCase } from "../../application/useCases/GetAllUsersUseCase";
import { getAllUsersSchema } from "../schemas/userSchemas";
import { ZodError } from "zod";

export class GetAllUsersController {
  constructor(private readonly getAllUsersUseCase: GetAllUsersUseCase) {}

  async run(req: Request, res: Response): Promise<void> {
    try {
      const dto = getAllUsersSchema.parse(req.query);
      const result = await this.getAllUsersUseCase.run(dto);
      
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
