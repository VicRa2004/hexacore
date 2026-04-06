import { Pagination } from "@/core/shared/domain/Pagination";
import { User } from "../User";
import { UserFilters } from "./UserFilters";

export interface UserRepository {
  find: (filters: UserFilters) => Pagination<User>;
  findById: (id: number) => User | null;

  create: (data: User) => User;
  update: (data: User) => User;

  delete: (id: number) => void;
}
