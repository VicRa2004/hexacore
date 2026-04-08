import { UpdateUserDto } from "../dtos/UpdateUserDto";
import { UserDto } from "../dtos/UserResponseDto";
import { UserRepository } from "../../domain/repository/UserRepository";
import { BaseError } from "@/core/shared/domain/error/BaseError";
import { UserMapper } from "../mappers/UserMapper";

export class UpdateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async run(id: number, dto: UpdateUserDto): Promise<UserDto> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new BaseError("Usuario no encontrado", 404);
    }

    // Aquí puedes acoplar tu lógica de dominio para actualizar el entity `user` antes de guardarlo.
    const updatedUser = await this.userRepository.update(user);
    return UserMapper.toDto(updatedUser);
  }
}
