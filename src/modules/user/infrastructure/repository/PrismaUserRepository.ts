import { Pagination } from "@/core/shared/domain/Pagination";
import { UserFilters } from "../../domain/repository/UserFilters";
import { UserRepository } from "../../domain/repository/UserRepository";
import { prisma } from "@/core/config/prisma";
import type { User } from "../../domain/User";

export class PrismaUserRepository implements UserRepository {
  async find(filters: UserFilters): Promise<Pagination<User>> {}
  findById: (id: number) => Promise<User | null>;
  create: (data: User) => Promise<User>;
  update: (data: User) => Promise<User>;
  delete: (id: number) => Promise<void>;
}
