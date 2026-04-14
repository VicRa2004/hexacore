import { injectable, inject } from "tsyringe";
import type { LoginDto } from "../dtos/LoginDto";
import { BaseError } from "@/core/shared/domain/error/BaseError";
import type { UserRepository } from "@/modules/user/domain/repository/UserRepository";
import type { PasswordHasher } from "@/modules/user/domain/service/PasswordHasher";
import type { TokenService } from "../../domain/service/TokenService";
import type { UserDto } from "@/modules/user/application/dtos/UserDto";
import { UserMapper } from "@/modules/user/application/mappers/UserMapper";

@injectable()
export class LoginUseCase {
  constructor(
    @inject("UserRepository") private readonly userRepository: UserRepository,
    @inject("PasswordHasher") private readonly passwordHasher: PasswordHasher,
    @inject("JwtService") private readonly tokenService: TokenService,
  ) {}

  async run(dto: LoginDto): Promise<{ token: string; user: UserDto }> {
    const users = await this.userRepository.find({
      page: 1,
      limit: 1,
      email: dto.email,
    });

    const [user] = users.data;

    if (!user) {
      throw new BaseError("Credenciales inválidas", 401);
    }

    const isPasswordValid = await this.passwordHasher.compare(
      dto.password,
      user.getPasswordHash(),
    );

    if (!isPasswordValid) {
      throw new BaseError("Credenciales inválidas", 401);
    }

    // Generar el token
    const token = this.tokenService.generateToken({
      id: user.getId(),
      email: user.getEmail(),
      role: user.getRole(),
    });

    return {
      token,
      user: UserMapper.toDto(user),
    };
  }
}
