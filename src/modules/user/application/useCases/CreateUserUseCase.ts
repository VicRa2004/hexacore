import { injectable, inject } from "tsyringe";
import { CreateUserDto } from "../dtos/CreateUserDto";
import { UserDto } from "../dtos/UserDto";
import { UserRepository } from "../../domain/repository/UserRepository";
import { User } from "../../domain/User";
import { BaseError } from "@/core/shared/domain/error/BaseError";
import { UserMapper } from "../mappers/UserMapper";
import type { PasswordHasher } from "../../domain/service/PasswordHasher";

@injectable()
export class CreateUserUseCase {
  constructor(
    @inject("UserRepository") private readonly userRepository: UserRepository,
    @inject("PasswordHasher") private readonly passwordHasherService: PasswordHasher,
  ) {}

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

    const passwordHash = await this.passwordHasherService.hash(dto.password);
    const user = User.create(dto.name || "", dto.email, passwordHash);
    const createdUser = await this.userRepository.create(user);

    return UserMapper.toDto(createdUser);
  }
}
