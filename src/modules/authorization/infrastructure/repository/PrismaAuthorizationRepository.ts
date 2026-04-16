import { injectable } from "tsyringe";
import { prisma } from "@/core/config/prisma";
import type { AuthorizationRepository } from "../../domain/repository/AuthorizationRepository";
import { Permission } from "../../domain/Permission";

/**
 * Implementación Prisma del repositorio de autorización.
 *
 * Algoritmo de resolución de permisos efectivos:
 * 1. Obtiene todos los permisos que el usuario hereda de sus roles.
 * 2. Obtiene los permisos directos del usuario (UserPermission).
 * 3. Fusiona ambos conjuntos:
 *    - Un permiso directo con `granted = true` lo añade al set.
 *    - Un permiso directo con `granted = false` lo ELIMINA del set
 *      (permite revocar granularmente un permiso de rol).
 */
@injectable()
export class PrismaAuthorizationRepository implements AuthorizationRepository {
  async getEffectivePermissions(userId: number): Promise<Permission[]> {
    // 1. Permisos heredados por roles
    const userWithRoles = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // 2. Permisos directos del usuario (excepciones)
    const userWithDirectPerms = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        directPermissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!userWithRoles || !userWithDirectPerms) {
      return [];
    }

    // Construir un mapa de permisos usando "resource:action" como clave
    const permissionMap = new Map<string, Permission>();

    // Agregar los permisos que vienen de todos los roles del usuario
    for (const userRole of userWithRoles.roles) {
      for (const rolePermission of userRole.role.permissions) {
        const p = rolePermission.permission;
        const key = `${p.resource}:${p.action}`;
        permissionMap.set(key, Permission.reconstitute(p.id, p.resource, p.action));
      }
    }

    // Aplicar las excepciones directas del usuario
    for (const userPerm of userWithDirectPerms.directPermissions) {
      const p = userPerm.permission;
      const key = `${p.resource}:${p.action}`;

      if (userPerm.granted) {
        // Conceder explícitamente (útil si el permiso no viene del rol)
        permissionMap.set(key, Permission.reconstitute(p.id, p.resource, p.action));
      } else {
        // Denegar explícitamente (revoca el permiso aunque lo tenga por rol)
        permissionMap.delete(key);
      }
    }

    return [...permissionMap.values()];
  }
}
