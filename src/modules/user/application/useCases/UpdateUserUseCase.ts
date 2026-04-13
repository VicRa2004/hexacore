import { injectable, inject } from "tsyringe";
import type { UpdateUserDto } from "../dtos/UpdateUserDto";
import type { UserDto } from "../dtos/UserDto";
import type { UserRepository } from "../../domain/repository/UserRepository";
import { UserMapper } from "../mappers/UserMapper";
import { UserNotFoundError } from "../../domain/error/UserNotFoundError";

@injectable()
export class UpdateUserUseCase {
  constructor(
    @inject("UserRepository") private readonly userRepository: UserRepository,
  ) {}

  async run(id: number, dto: UpdateUserDto): Promise<UserDto> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new UserNotFoundError();
    }

    // Aquí puedes acoplar tu lógica de dominio para actualizar el entity `user` antes de guardarlo.
    const updatedUser = await this.userRepository.update(user);
    return UserMapper.toDto(updatedUser);
  }
}
