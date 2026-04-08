import { Response } from "express";
import z, { ZodError } from "zod";

export abstract class BaseController {
  protected handleError(error: unknown, res: Response): void {
    if (error instanceof ZodError) {
      res.status(400).json({
        error: "Validation error",
        details: z.treeifyError(error),
      });
      return;
    }

    if (typeof error === "object" && error !== null && "statusCode" in error) {
      const err = error as any;
      res.status(err.statusCode).json({ error: err.message });
      return;
    }

    res.status(500).json({
      error: (error as any)?.message || "Internal server error",
    });
  }

  protected ok(res: Response, data: unknown): void {
    res.status(200).json(data);
  }

  protected created(res: Response, data: unknown): void {
    res.status(201).json(data);
  }

  protected async executeSafely(
    handler: () => Promise<void>,
    res: Response,
  ): Promise<void> {
    try {
      return await handler();
    } catch (error) {
      return this.handleError(error, res);
    }
  }
}
