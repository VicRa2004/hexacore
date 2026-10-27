import { prisma } from "@/core/config/prisma";
import type { AutorizacionRepository } from "../../domain/repository/AutorizacionRepository";
import { Permiso } from "../../domain/Permiso";
import { PermisoNoEncontradoError } from "../../domain/error/PermisoNoEncontradoError";
import { PermisoYaExisteError } from "../../domain/error/PermisoYaExisteError";

/**
 * Implementación Prisma del repositorio de autorización.
 *
 * Algoritmo de resolución de permisos efectivos:
 * 1. Obtiene todos los permisos que el usuario hereda de sus roles.
 * 2. Obtiene los permisos directos del usuario (UsuarioPermiso).
 * 3. Fusiona ambos conjuntos:
 *    - Un permiso directo con `concedido = true` lo añade al set.
 *    - Un permiso directo con `concedido = false` lo ELIMINA del set
 *      (permite revocar granularmente un permiso de rol).
 */
export class PrismaAutorizacionRepository implements AutorizacionRepository {
	// ── Permisos efectivos ──────────────────────────────────────────────────────

	async obtenerPermisosEfectivos(usuarioId: number): Promise<Permiso[]> {
		// Roles y permisos directos en una sola query; sólo cuenta lo activo.
		const usuario = await prisma.usuario.findUnique({
			where: { id: usuarioId, isActivo: true },
			include: {
				roles: {
					where: { rol: { isActivo: true } },
					include: {
						rol: {
							include: {
								permisos: {
									where: { permiso: { isActivo: true } },
									include: { permiso: true },
								},
							},
						},
					},
				},
				permisosDirectos: {
					where: { permiso: { isActivo: true } },
					include: { permiso: true },
				},
			},
		});

		if (!usuario) {
			return [];
		}

		// Construir un mapa de permisos usando "recurso:accion" como clave
		const mapaPermisos = new Map<string, Permiso>();

		// Agregar los permisos que vienen de todos los roles del usuario
		for (const usuarioRol of usuario.roles) {
			for (const rolPermiso of usuarioRol.rol.permisos) {
				const p = rolPermiso.permiso;
				const key = `${p.recurso}:${p.accion}`;
				mapaPermisos.set(key, Permiso.reconstituir(p.id, p.recurso, p.accion));
			}
		}

		// Aplicar las excepciones directas del usuario
		for (const permisoUsuario of usuario.permisosDirectos) {
			const p = permisoUsuario.permiso;
			const key = `${p.recurso}:${p.accion}`;

			if (permisoUsuario.concedido) {
				// Conceder explícitamente (útil si el permiso no viene del rol)
				mapaPermisos.set(key, Permiso.reconstituir(p.id, p.recurso, p.accion));
			} else {
				// Denegar explícitamente (revoca el permiso aunque lo tenga por rol)
				mapaPermisos.delete(key);
			}
		}

		return [...mapaPermisos.values()];
	}

	// ── CRUD de permisos ────────────────────────────────────────────────────────

	async buscarTodos(): Promise<Permiso[]> {
		const registros = await prisma.permiso.findMany({
			orderBy: [{ recurso: "asc" }, { accion: "asc" }],
		});

		return registros.map((p) =>
			Permiso.reconstituir(p.id, p.recurso, p.accion),
		);
	}

	async buscarPorId(id: number): Promise<Permiso | null> {
		const registro = await prisma.permiso.findUnique({ where: { id } });

		if (!registro) return null;

		return Permiso.reconstituir(registro.id, registro.recurso, registro.accion);
	}

	async crear(recurso: string, accion: string): Promise<Permiso> {
		// Verificar unicidad antes de insertar (para devolver error de dominio claro)
		const existente = await prisma.permiso.findUnique({
			where: { recurso_accion: { recurso, accion } },
		});

		if (existente) {
			throw new PermisoYaExisteError(recurso, accion);
		}

		const registro = await prisma.permiso.create({
			data: { recurso, accion },
		});

		return Permiso.reconstituir(registro.id, registro.recurso, registro.accion);
	}

	async actualizar(
		id: number,
		recurso: string,
		accion: string,
	): Promise<Permiso> {
		const existente = await prisma.permiso.findUnique({ where: { id } });

		if (!existente) {
			throw new PermisoNoEncontradoError(id);
		}

		// Verificar que la nueva combinación no choque con otro registro
		const conflicto = await prisma.permiso.findFirst({
			where: { recurso, accion, NOT: { id } },
		});

		if (conflicto) {
			throw new PermisoYaExisteError(recurso, accion);
		}

		const registro = await prisma.permiso.update({
			where: { id },
			data: { recurso, accion },
		});

		return Permiso.reconstituir(registro.id, registro.recurso, registro.accion);
	}

	async eliminar(id: number): Promise<void> {
		const existente = await prisma.permiso.findUnique({ where: { id } });

		if (!existente) {
			throw new PermisoNoEncontradoError(id);
		}

		await prisma.permiso.delete({ where: { id } });
	}
}
