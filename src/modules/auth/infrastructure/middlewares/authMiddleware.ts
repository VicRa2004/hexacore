import { Request, Response, NextFunction } from "express";
import { container } from "tsyringe";
import { JwtService } from "../service/JwtService";

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ success: false, error: "No se proporcionó un token de autenticación" });
    return;
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ success: false, error: "Token inválido" });
    return;
  }

  try {
    const jwtService = container.resolve(JwtService);
    const decoded = jwtService.verifyToken(token);
    
    // Adjuntar el payload decodificado a la request (ej. req.user)
    (req as any).user = decoded;
    
    next();
  } catch (error) {
    res.status(401).json({ success: false, error: "Token inválido o expirado" });
  }
};
