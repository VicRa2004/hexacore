import { Request, Response, NextFunction } from "express";
import { container } from "tsyringe";
import { CheckUserPermissionUseCase } from "@/modules/authorization/application/useCases/CheckUserPermissionUseCase";
import { ForbiddenError } from "@/modules/authorization/domain/error/ForbiddenError";
import { BaseError } from "@/core/shared/domain/error/BaseError";

/**
 * Middleware de autorización granular (RBAC).
 *
 * Uso en rutas:
 * ```ts
 * router.post("/turnos", authMiddleware, requirePermission("turnos", "create"), controller.run.bind(controller));
 * ```
 *
 * IMPORTANTE: Debe ir DESPUÉS de `authMiddleware`, ya que depende de
 * que `req.user.id` esté disponible en la request.
 *
 * @param resource - Nombre del recurso (ej: "turnos")
 * @param action   - Acción requerida (ej: "create", "read", "update", "delete")
 */
export const requirePermission = (resource: string, action: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId: number | undefined = (req as any).user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: "Usuario no autenticado. Ejecuta authMiddleware antes.",
      });
      return;
    }

    try {
      const checkPermission = container.resolve(CheckUserPermissionUseCase);
      await checkPermission.run(userId, resource, action);
      next();
    } catch (error) {
      if (error instanceof ForbiddenError || error instanceof BaseError) {
        res.status(error.code).json({ success: false, error: error.message });
        return;
      }
      res.status(500).json({ success: false, error: "Error interno al verificar permisos" });
    }
  };
};
