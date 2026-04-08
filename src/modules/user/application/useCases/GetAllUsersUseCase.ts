import { UserRepository } from "../../domain/repository/UserRepository";
import { GetAllUsersDto } from "../dtos/GetAllUsersDto";
import { UserDto } from "../dtos/UserResponseDto";
import { UserMapper } from "../mappers/UserMapper";
import { Pagination } from "@/core/shared/domain/Pagination";

export class GetAllUsersUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async run(dto: GetAllUsersDto): Promise<Pagination<UserDto>> {
    const filters = {
      page: dto.page,
      limit: dto.limit,
      email: dto.email,
    };

    const paginatedResult = await this.userRepository.find(filters);

    return {
      ...paginatedResult,
      data: paginatedResult.data.map((user) => UserMapper.toDto(user)),
    };
  }
}
