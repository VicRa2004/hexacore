import { injectable } from "tsyringe";
import type { Pagination } from "@/core/shared/domain/Pagination";
import type { UserFilters } from "../../domain/repository/UserFilters";
import type { UserRepository } from "../../domain/repository/UserRepository";
import { prisma } from "@/core/config/prisma";
import { User } from "../../domain/User";

/**
 * Representa la estructura cruda del registro de Prisma.
 * Se define localmente para desacoplar la infraestructura de los tipos auto-generados.
 */
interface PrismaUserRecord {
	id: number;
	email: string;
	name: string;
	password: string;
	isActive: boolean;
	roles: {
		role: { name: string };
	}[];
}

@injectable()
export class PrismaUserRepository implements UserRepository {
	/**
	 * Transforma un registro de Prisma en una entidad de dominio.
	 * Se utiliza `reconstitute` porque el usuario ya existe en la base de datos.
	 */
	private toDomain(raw: PrismaUserRecord): User {
		// Con el esquema N-a-N un usuario puede tener varios roles.
		// Tomamos el primero como "rol principal" para mantener compatibilidad
		// con la entidad de dominio User que actualmente modela un único rol.
		const primaryRole = raw.roles[0]?.role.name ?? "USER";

		return User.reconstitute(
			raw.name,
			raw.email,
			raw.password,
			raw.isActive,
			raw.id,
			primaryRole,
		);
	}

	/**
	 * Busca usuarios con paginación y filtros opcionales.
	 * Calcula el offset basado en la página y el límite solicitados.
	 */
	async find(filters: UserFilters): Promise<Pagination<User>> {
		const { page, limit, email } = filters;
		const skip = (page - 1) * limit;

		const where = {
			...(email && {
				email: { contains: email, mode: "insensitive" as const },
			}),
		};

		const [data, totalItems] = await prisma.$transaction([
			prisma.user.findMany({
				where,
				skip,
				take: limit,
				orderBy: { id: "asc" },
				include: { roles: { include: { role: true } } },
			}),
			prisma.user.count({ where }),
		]);

		return {
			data: data.map((record) => this.toDomain(record)),
			page,
			totalItems,
			totalPages: Math.ceil(totalItems / limit),
		};
	}

	/**
	 * Busca un usuario por su ID.
	 * Retorna null si no existe, delegando la validación al caso de uso.
	 */
	async findById(id: number): Promise<User | null> {
		const record = await prisma.user.findUnique({
			where: { id },
			include: { roles: { include: { role: true } } },
		});

		if (!record) return null;

		return this.toDomain(record);
	}

	/**
	 * Persiste un nuevo usuario en la base de datos.
	 * Los datos se extraen de la entidad de dominio para respetar la separación de capas.
	 */
	async create(data: User): Promise<User> {
		const record = await prisma.user.create({
			data: {
				name: data.getName(),
				email: data.getEmail(),
				password: data.getPasswordHash(),
				isActive: data.getIsActive(),
				// Asignar el rol inicial del usuario via la tabla intermedia UserRole
				roles: {
					create: {
						role: { connect: { name: data.getRole() } },
					},
				},
			},
			include: { roles: { include: { role: true } } },
		});

		return this.toDomain(record);
	}

	/**
	 * Actualiza un usuario existente en la base de datos.
	 * Se actualiza por ID, extrayendo los datos actuales de la entidad de dominio.
	 */
	async update(data: User): Promise<User> {
		const record = await prisma.user.update({
			where: { id: data.getId() },
			data: {
				name: data.getName(),
				email: data.getEmail(),
				password: data.getPasswordHash(),
				isActive: data.getIsActive(),
			},
			include: { roles: { include: { role: true } } },
		});

		return this.toDomain(record);
	}

	/**
	 * Elimina un usuario por su ID.
	 */
	async delete(id: number): Promise<void> {
		await prisma.user.delete({
			where: { id },
		});
	}
}
