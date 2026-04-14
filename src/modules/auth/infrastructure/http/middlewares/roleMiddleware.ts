import { Request, Response, NextFunction } from "express";

export const roleMiddleware = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const userRole = (req as any).user?.role;

    if (!userRole) {
      res.status(403).json({ success: false, error: "Rol no encontrado en el token" });
      return;
    }

    if (!allowedRoles.includes(userRole)) {
      res.status(403).json({ success: false, error: "No tienes los permisos necesarios" });
      return;
    }

    next();
  };
};
