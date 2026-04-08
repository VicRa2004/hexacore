import { CreateUserDto } from "../dtos/CreateUserDto";
import { UserDto } from "../dtos/UserResponseDto";
import { UserRepository } from "../../domain/repository/UserRepository";
import { User } from "../../domain/User";
import { BaseError } from "@/core/shared/domain/error/BaseError";
import { UserMapper } from "../mappers/UserMapper";

export class CreateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async run(dto: CreateUserDto): Promise<UserDto> {
    const existingUsers = await this.userRepository.find({
      page: 1,
      limit: 1,
      email: dto.email,
    });
    if (existingUsers?.data?.length > 0) {
      throw new BaseError(
        "El usuario con este correo electrónico ya existe",
        400,
      );
    }

    const user = User.create(dto.name || "", dto.email);
    const createdUser = await this.userRepository.create(user);

    return UserMapper.toDto(createdUser);
  }
}
