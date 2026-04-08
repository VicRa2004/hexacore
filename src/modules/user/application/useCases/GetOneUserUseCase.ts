import { UserRepository } from "../../domain/repository/UserRepository";
import { BaseError } from "@/core/shared/domain/error/BaseError";
import { GetOneUserDto } from "../dtos/GetOneUserDto";
import { UserDto } from "../dtos/UserResponseDto";
import { UserMapper } from "../mappers/UserMapper";

export class GetOneUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async run(dto: GetOneUserDto): Promise<UserDto> {
    const user = await this.userRepository.findById(dto.id);
    if (!user) {
      throw new BaseError("Usuario no encontrado", 404);
    }
    return UserMapper.toDto(user);
  }
}
