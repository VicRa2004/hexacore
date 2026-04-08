import { UserNotFoundError } from "../../domain/error/UserNotFoundError";
import { UserRepository } from "../../domain/repository/UserRepository";
import { GetOneUserDto } from "../dtos/GetOneUserDto";
import { UserDto } from "../dtos/UserDto";
import { UserMapper } from "../mappers/UserMapper";

export class GetOneUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async run(dto: GetOneUserDto): Promise<UserDto> {
    const user = await this.userRepository.findById(dto.id);
    if (!user) {
      throw new UserNotFoundError();
    }
    return UserMapper.toDto(user);
  }
}
