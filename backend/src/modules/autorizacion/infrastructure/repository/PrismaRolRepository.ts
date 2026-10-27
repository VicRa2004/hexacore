import { prisma } from "@/core/config/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { Permiso } from "../../domain/Permiso";
import { Rol } from "../../domain/Rol";
import { PermisoNoEncontradoError } from "../../domain/error/PermisoNoEncontradoError";
import { RolEnUsoError } from "../../domain/error/RolEnUsoError";
import { RolNoEncontradoError } from "../../domain/error/RolNoEncontradoError";
import { RolYaExisteError } from "../../domain/error/RolYaExisteError";
import type {
	AsignacionUsuario,
	DatosRol,
	RolRepository,
} from "../../domain/repository/RolRepository";

const conPermisos = {
	permisos: { include: { permiso: true } },
} satisfies Prisma.RolInclude;

type RolConPermisos = Prisma.RolGetPayload<{ include: typeof conPermisos }>;

const aDominio = (raw: RolConPermisos): Rol =>
	Rol.reconstituir(
		raw.id,
		raw.nombre,
		raw.descripcion,
		raw.permisos.map(({ permiso: p }) =>
			Permiso.reconstituir(p.id, p.recurso, p.accion),
		),
	);

/** Lanza el error de dominio del primer ID que no exista (en vez de un P2003 genérico). */
async function verificarExisten(
	tx: Prisma.TransactionClient,
	permisoIds: number[],
	rolIds: number[] = [],
): Promise<void> {
	const [permisos, roles] = await Promise.all([
		tx.permiso.findMany({
			where: { id: { in: permisoIds } },
			select: { id: true },
		}),
		tx.rol.findMany({ where: { id: { in: rolIds } }, select: { id: true } }),
	]);
	const permisosOk = new Set(permisos.map((p) => p.id));
	const rolesOk = new Set(roles.map((r) => r.id));

	const permisoFalta = permisoIds.find((id) => !permisosOk.has(id));
	if (permisoFalta !== undefined)
		throw new PermisoNoEncontradoError(permisoFalta);
	const rolFalta = rolIds.find((id) => !rolesOk.has(id));
	if (rolFalta !== undefined) throw new RolNoEncontradoError(rolFalta);
}

async function verificarNombreLibre(
	tx: Prisma.TransactionClient,
	nombre: string,
	excluirId?: number,
): Promise<void> {
	const conflicto = await tx.rol.findFirst({
		where: { nombre, NOT: excluirId ? { id: excluirId } : undefined },
	});
	if (conflicto) throw new RolYaExisteError(nombre);
}

/** Implementación Prisma del repositorio de roles y asignaciones. */
export class PrismaRolRepository implements RolRepository {
	async buscarTodos(): Promise<Rol[]> {
		const registros = await prisma.rol.findMany({
			include: conPermisos,
			orderBy: { nombre: "asc" },
		});
		return registros.map(aDominio);
	}

	async buscarPorId(id: number): Promise<Rol | null> {
		const registro = await prisma.rol.findUnique({
			where: { id },
			include: conPermisos,
		});
		return registro ? aDominio(registro) : null;
	}

	async crear(datos: DatosRol): Promise<Rol> {
		const permisoIds = [...new Set(datos.permisoIds)];

		return prisma.$transaction(async (tx) => {
			await verificarNombreLibre(tx, datos.nombre);
			await verificarExisten(tx, permisoIds);

			const registro = await tx.rol.create({
				data: {
					nombre: datos.nombre,
					descripcion: datos.descripcion,
					permisos: { create: permisoIds.map((permisoId) => ({ permisoId })) },
				},
				include: conPermisos,
			});
			return aDominio(registro);
		});
	}

	async actualizar(id: number, datos: DatosRol): Promise<Rol> {
		const permisoIds = [...new Set(datos.permisoIds)];

		return prisma.$transaction(async (tx) => {
			if (!(await tx.rol.findUnique({ where: { id } }))) {
				throw new RolNoEncontradoError(id);
			}
			await verificarNombreLibre(tx, datos.nombre, id);
			await verificarExisten(tx, permisoIds);

			const registro = await tx.rol.update({
				where: { id },
				data: {
					nombre: datos.nombre,
					descripcion: datos.descripcion,
					permisos: {
						deleteMany: {},
						create: permisoIds.map((permisoId) => ({ permisoId })),
					},
				},
				include: conPermisos,
			});
			return aDominio(registro);
		});
	}

	async eliminar(id: number): Promise<void> {
		const registro = await prisma.rol.findUnique({
			where: { id },
			include: { _count: { select: { usuarios: true } } },
		});

		if (!registro) throw new RolNoEncontradoError(id);
		if (registro._count.usuarios > 0) throw new RolEnUsoError(registro.nombre);

		await prisma.rol.delete({ where: { id } });
	}

	async obtenerAsignacion(
		usuarioId: number,
	): Promise<AsignacionUsuario | null> {
		const usuario = await prisma.usuario.findUnique({
			where: { id: usuarioId },
			select: {
				roles: { select: { rolId: true }, orderBy: { rolId: "asc" } },
				permisosDirectos: {
					select: { permisoId: true, concedido: true },
					orderBy: { permisoId: "asc" },
				},
			},
		});
		if (!usuario) return null;

		return {
			rolIds: usuario.roles.map((r) => r.rolId),
			permisosDirectos: usuario.permisosDirectos,
		};
	}

	async actualizarAsignacion(
		usuarioId: number,
		asignacion: AsignacionUsuario,
	): Promise<void> {
		const rolIds = [...new Set(asignacion.rolIds)];
		// Si un permiso viene repetido, gana la última decisión.
		const directos = new Map(
			asignacion.permisosDirectos.map((p) => [p.permisoId, p.concedido]),
		);

		await prisma.$transaction(async (tx) => {
			await verificarExisten(tx, [...directos.keys()], rolIds);

			await tx.usuarioRol.deleteMany({ where: { usuarioId } });
			await tx.usuarioPermiso.deleteMany({ where: { usuarioId } });
			await tx.usuarioRol.createMany({
				data: rolIds.map((rolId) => ({ usuarioId, rolId })),
			});
			await tx.usuarioPermiso.createMany({
				data: [...directos].map(([permisoId, concedido]) => ({
					usuarioId,
					permisoId,
					concedido,
				})),
			});
		});
	}
}
