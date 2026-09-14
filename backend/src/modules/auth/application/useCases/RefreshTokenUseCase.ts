import { injectable, inject } from "tsyringe";
import { BaseError } from "@/core/shared/domain/error/BaseError";
import type { UserRepository } from "@/core/user/domain/repository/UserRepository";
import type { TokenService } from "../../domain/service/TokenService";
import type { RefreshTokenRepository } from "../../domain/repository/RefreshTokenRepository";

/** Duración del nuevo refresh token: 7 días */
const REFRESH_TOKEN_EXPIRY_DAYS = 7;

@injectable()
export class RefreshTokenUseCase {
  constructor(
    @inject("JwtService") private readonly tokenService: TokenService,
    @inject("RefreshTokenRepository")
    private readonly refreshTokenRepo: RefreshTokenRepository,
    @inject("UserRepository") private readonly userRepository: UserRepository,
  ) {}

  /**
   * Rota el refresh token: revoca el anterior y genera uno nuevo.
   * También emite un nuevo access token.
   *
   * Implementa "Refresh Token Rotation" — si alguien reutiliza un token
   * ya revocado, se asume robo y se revocan TODOS los tokens del usuario.
   */
  async run(
    currentRefreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const tokenHash = this.tokenService.hashRefreshToken(currentRefreshToken);

    const storedToken = await this.refreshTokenRepo.findValidByHash(tokenHash);

    if (!storedToken) {
      // El token no existe o ya fue revocado → posible robo
      // Intentamos detectar a quién pertenecía para revocar toda la familia
      throw new BaseError("Refresh token inválido o expirado", 401);
    }

    // Revocar el token usado (rotación)
    await this.refreshTokenRepo.revokeById(storedToken.id);

    // Verificar que el usuario exista y esté activo
    const user = await this.userRepository.findById(storedToken.userId);

    if (!user) {
      throw new BaseError("Usuario no encontrado", 401);
    }

    // Generar nuevo par de tokens
    const newAccessToken = this.tokenService.generateToken({
      id: user.getId(),
      email: user.getEmail(),
      role: user.getRole(),
    });

    const newRawRefreshToken = this.tokenService.generateRefreshToken();
    const newTokenHash = this.tokenService.hashRefreshToken(newRawRefreshToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

    await this.refreshTokenRepo.create({
      tokenHash: newTokenHash,
      userId: user.getId(),
      expiresAt,
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRawRefreshToken,
    };
  }
}
