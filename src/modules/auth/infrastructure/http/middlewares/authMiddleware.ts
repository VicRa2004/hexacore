import type { Request, Response, NextFunction } from "express";
import { injectable, inject } from "tsyringe";
import type { JwtService } from "../../service/JwtService";

@injectable()
export class AuthMiddleware {
  constructor(
    @inject("JwtService")
    private readonly jwtService: JwtService,
  ) {}

  handle = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        error: "No se proporcionó un token de autenticación",
      });
      return;
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      res.status(401).json({ success: false, error: "Token inválido" });
      return;
    }

    try {
      const decoded = this.jwtService.verifyToken(token);

      // Adjuntar el payload decodificado a la request (ej. req.user)
      (req as any).user = decoded;

      next();
    } catch (error) {
      console.log("Error auth middleware");
      console.log(error);
      res
        .status(401)
        .json({ success: false, error: "Token inválido o expirado" });
    }
  };
}
