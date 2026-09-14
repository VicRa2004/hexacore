import { injectable } from "tsyringe";
import { prisma } from "@/core/config/prisma";
import type { AuthorizationRepository } from "../../domain/repository/AuthorizationRepository";
import { Permission } from "../../domain/Permission";
import { PermissionNotFoundError } from "../../domain/error/PermissionNotFoundError";
import { PermissionAlreadyExistsError } from "../../domain/error/PermissionAlreadyExistsError";

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
	// ── Permisos efectivos ──────────────────────────────────────────────────────

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
				permissionMap.set(
					key,
					Permission.reconstitute(p.id, p.resource, p.action),
				);
			}
		}

		// Aplicar las excepciones directas del usuario
		for (const userPerm of userWithDirectPerms.directPermissions) {
			const p = userPerm.permission;
			const key = `${p.resource}:${p.action}`;

			if (userPerm.granted) {
				// Conceder explícitamente (útil si el permiso no viene del rol)
				permissionMap.set(
					key,
					Permission.reconstitute(p.id, p.resource, p.action),
				);
			} else {
				// Denegar explícitamente (revoca el permiso aunque lo tenga por rol)
				permissionMap.delete(key);
			}
		}

		return [...permissionMap.values()];
	}

	// ── CRUD de permisos ────────────────────────────────────────────────────────

	async findAll(): Promise<Permission[]> {
		const records = await prisma.permission.findMany({
			orderBy: [{ resource: "asc" }, { action: "asc" }],
		});

		return records.map((p) =>
			Permission.reconstitute(p.id, p.resource, p.action),
		);
	}

	async findById(id: number): Promise<Permission | null> {
		const record = await prisma.permission.findUnique({ where: { id } });

		if (!record) return null;

		return Permission.reconstitute(record.id, record.resource, record.action);
	}

	async create(resource: string, action: string): Promise<Permission> {
		// Verificar unicidad antes de insertar (para devolver error de dominio claro)
		const existing = await prisma.permission.findUnique({
			where: { resource_action: { resource, action } },
		});

		if (existing) {
			throw new PermissionAlreadyExistsError(resource, action);
		}

		const record = await prisma.permission.create({
			data: { resource, action },
		});

		return Permission.reconstitute(record.id, record.resource, record.action);
	}

	async update(
		id: number,
		resource: string,
		action: string,
	): Promise<Permission> {
		const existing = await prisma.permission.findUnique({ where: { id } });

		if (!existing) {
			throw new PermissionNotFoundError(id);
		}

		// Verificar que la nueva combinación no choque con otro registro
		const conflict = await prisma.permission.findFirst({
			where: { resource, action, NOT: { id } },
		});

		if (conflict) {
			throw new PermissionAlreadyExistsError(resource, action);
		}

		const record = await prisma.permission.update({
			where: { id },
			data: { resource, action },
		});

		return Permission.reconstitute(record.id, record.resource, record.action);
	}

	async delete(id: number): Promise<void> {
		const existing = await prisma.permission.findUnique({ where: { id } });

		if (!existing) {
			throw new PermissionNotFoundError(id);
		}

		await prisma.permission.delete({ where: { id } });
	}
}
