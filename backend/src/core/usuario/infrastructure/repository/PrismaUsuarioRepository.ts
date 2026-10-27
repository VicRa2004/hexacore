import type { Paginacion } from "@/core/shared/domain/Paginacion";
import type { UsuarioFiltros } from "../../domain/repository/UsuarioFiltros";
import type { UsuarioRepository } from "../../domain/repository/UsuarioRepository";
import { prisma } from "@/core/config/prisma";
import { Usuario } from "../../domain/Usuario";

/**
 * Representa la estructura cruda del registro de Prisma.
 * Se define localmente para desacoplar la infraestructura de los tipos auto-generados.
 */
interface PrismaUsuarioRecord {
	id: number;
	email: string;
	nombre: string;
	password: string;
	isActivo: boolean;
	emailVerificadoEn: Date | null;
	avatar: string | null;
	roles: {
		rol: { nombre: string };
	}[];
}

export class PrismaUsuarioRepository implements UsuarioRepository {
	/**
	 * Transforma un registro de Prisma en una entidad de dominio.
	 * Se utiliza `reconstituir` porque el usuario ya existe en la base de datos.
	 */
	private toDomain(raw: PrismaUsuarioRecord): Usuario {
		return Usuario.reconstituir(
			raw.nombre,
			raw.email,
			raw.password,
			raw.isActivo,
			raw.id,
			raw.roles.map(({ rol }) => rol.nombre),
			raw.emailVerificadoEn !== null,
			raw.avatar,
		);
	}

	/**
	 * Busca usuarios con paginación y filtros opcionales.
	 * Calcula el offset basado en la página y el límite solicitados.
	 */
	async buscar(filtros: UsuarioFiltros): Promise<Paginacion<Usuario>> {
		const { pagina, limite, email } = filtros;
		const skip = (pagina - 1) * limite;

		const where = {
			deletedAt: null,
			...(email && {
				email: { contains: email, mode: "insensitive" as const },
			}),
		};

		const [registros, totalElementos] = await prisma.$transaction([
			prisma.usuario.findMany({
				where,
				skip,
				take: limite,
				orderBy: { id: "asc" },
				include: { roles: { include: { rol: true } } },
			}),
			prisma.usuario.count({ where }),
		]);

		return {
			datos: registros.map((registro) => this.toDomain(registro)),
			pagina,
			totalElementos,
			totalPaginas: Math.ceil(totalElementos / limite),
		};
	}

	/**
	 * Busca un usuario por su ID.
	 * Retorna null si no existe, delegando la validación al caso de uso.
	 */
	async buscarPorId(id: number): Promise<Usuario | null> {
		const registro = await prisma.usuario.findUnique({
			where: { id, deletedAt: null },
			include: { roles: { include: { rol: true } } },
		});

		if (!registro) return null;

		return this.toDomain(registro);
	}

	/**
	 * Busca un usuario por email exacto (login, registro, unicidad).
	 */
	async buscarPorEmail(email: string): Promise<Usuario | null> {
		const registro = await prisma.usuario.findUnique({
			where: { email, deletedAt: null },
			include: { roles: { include: { rol: true } } },
		});

		if (!registro) return null;

		return this.toDomain(registro);
	}

	/**
	 * Persiste un nuevo usuario en la base de datos.
	 * Los datos se extraen de la entidad de dominio para respetar la separación de capas.
	 */
	async crear(data: Usuario): Promise<Usuario> {
		const registro = await prisma.usuario.create({
			data: {
				nombre: data.getNombre(),
				email: data.getEmail(),
				password: data.getPasswordHash(),
				isActivo: data.getIsActivo(),
				// Asignar los roles iniciales vía la tabla intermedia UsuarioRol
				roles: {
					create: data
						.getRoles()
						.map((nombre) => ({ rol: { connect: { nombre } } })),
				},
			},
			include: { roles: { include: { rol: true } } },
		});

		return this.toDomain(registro);
	}

	/**
	 * Actualiza un usuario existente en la base de datos.
	 * Se actualiza por ID, extrayendo los datos actuales de la entidad de dominio.
	 */
	async actualizar(data: Usuario): Promise<Usuario> {
		const registro = await prisma.usuario.update({
			where: { id: data.getId() },
			data: {
				nombre: data.getNombre(),
				email: data.getEmail(),
				password: data.getPasswordHash(),
				isActivo: data.getIsActivo(),
				avatar: data.getAvatar(),
			},
			include: { roles: { include: { rol: true } } },
		});

		return this.toDomain(registro);
	}

	/**
	 * Borrado lógico: marca `deletedAt` y desactiva. Las filas siguen en la BD
	 * (y su email sigue ocupado), pero ninguna consulta del repositorio las devuelve.
	 */
	async eliminar(id: number): Promise<void> {
		await prisma.usuario.update({
			where: { id },
			data: { deletedAt: new Date(), isActivo: false },
		});
	}
}
