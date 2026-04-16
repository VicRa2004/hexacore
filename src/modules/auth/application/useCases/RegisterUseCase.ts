import { injectable, inject } from "tsyringe";
import type { RegisterDto } from "../dtos/RegisterDto";
import { BaseError } from "@/core/shared/domain/error/BaseError";
import type { UserRepository } from "@/core/user/domain/repository/UserRepository";
import type { PasswordHasher } from "@/core/user/domain/service/PasswordHasher";
import { User } from "@/core/user/domain/User";
import type { TokenService } from "../../domain/service/TokenService";
import type { UserDto } from "@/core/user/application/dtos/UserDto";
import { UserMapper } from "@/core/user/application/mappers/UserMapper";

@injectable()
export class RegisterUseCase {
  constructor(
    @inject("UserRepository") private readonly userRepository: UserRepository,
    @inject("PasswordHasher") private readonly passwordHasher: PasswordHasher,
    @inject("JwtService") private readonly tokenService: TokenService,
  ) {}

  async run(dto: RegisterDto): Promise<{ token: string; user: UserDto }> {
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

    const passwordHash = await this.passwordHasher.hash(dto.password);
    // Role comes as 'USER' by default in user create
    const user = User.create(dto.name, dto.email, passwordHash, "USER");

    const createdUser = await this.userRepository.create(user);

    // Generar el token para iniciar sesión automáticamente
    const token = this.tokenService.generateToken({
      id: createdUser.getId(),
      email: createdUser.getEmail(),
      role: createdUser.getRole(),
    });

    return {
      token,
      user: UserMapper.toDto(createdUser),
    };
  }
}
