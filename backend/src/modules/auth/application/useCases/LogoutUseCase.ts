import { injectable, inject } from "tsyringe";
import { BaseError } from "@/core/shared/domain/error/BaseError";
import type { TokenService } from "../../domain/service/TokenService";
import type { RefreshTokenRepository } from "../../domain/repository/RefreshTokenRepository";

@injectable()
export class LogoutUseCase {
  constructor(
    @inject("JwtService") private readonly tokenService: TokenService,
    @inject("RefreshTokenRepository")
    private readonly refreshTokenRepo: RefreshTokenRepository,
  ) {}

  /**
   * Revoca el refresh token proporcionado para invalidar la sesión.
   * El access token seguirá siendo válido hasta que expire (máx 15 min),
   * pero no se podrá obtener uno nuevo sin un refresh token válido.
   */
  async run(refreshToken: string): Promise<void> {
    const tokenHash = this.tokenService.hashRefreshToken(refreshToken);
    const storedToken =
      await this.refreshTokenRepo.findValidByHash(tokenHash);

    if (!storedToken) {
      throw new BaseError("Refresh token inválido", 400);
    }

    await this.refreshTokenRepo.revokeById(storedToken.id);
  }
}
