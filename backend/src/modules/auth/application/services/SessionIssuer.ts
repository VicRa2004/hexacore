import { injectable, inject } from "tsyringe";
import { TOKENS } from "@/core/shared/application/tokens";
import type { User } from "@/core/user";
import type { TokenService } from "../../domain/service/TokenService";
import type { RefreshTokenRepository } from "../../domain/repository/RefreshTokenRepository";

/** Duración del refresh token: 7 días */
const REFRESH_TOKEN_EXPIRY_DAYS = 7;

/**
 * Emite una sesión nueva para un usuario: access token de corta duración (15 min)
 * y refresh token opaco persistido como hash en BD.
 */
@injectable()
export class SessionIssuer {
	constructor(
		@inject(TOKENS.TokenService) private readonly tokenService: TokenService,
		@inject(TOKENS.RefreshTokenRepository)
		private readonly refreshTokenRepo: RefreshTokenRepository,
	) {}

	async issue(
		user: User,
	): Promise<{ accessToken: string; refreshToken: string }> {
		const accessToken = this.tokenService.generateToken({
			id: user.getId(),
			email: user.getEmail(),
			roles: user.getRoles(),
		});

		const refreshToken = this.tokenService.generateRefreshToken();

		const expiresAt = new Date();
		expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

		await this.refreshTokenRepo.create({
			tokenHash: this.tokenService.hashRefreshToken(refreshToken),
			userId: user.getId(),
			expiresAt,
		});

		return { accessToken, refreshToken };
	}
}
