import { injectable, inject } from "tsyringe";
import type { LoginDto } from "../dtos/LoginDto";
import { BaseError } from "@/core/shared/domain/error/BaseError";
import type { UserRepository } from "@/core/user";
import type { PasswordHasher } from "@/core/user";
import type { TokenService } from "../../domain/service/TokenService";
import type { RefreshTokenRepository } from "../../domain/repository/RefreshTokenRepository";
import type { UserDto } from "@/core/user";
import { UserMapper } from "@/core/user";

/**
 * Hash bcrypt de una contraseña aleatoria: si el email no existe se compara
 * igualmente contra él, para que la respuesta tarde lo mismo.
 */
const DUMMY_PASSWORD_HASH =
	"$2b$10$UZQKZ7yo9nGiqhSbmYdj4eV9jrthslRlUx4lX.r5eMN.sW4Pb.boi";

/** Duración del refresh token: 7 días */
const REFRESH_TOKEN_EXPIRY_DAYS = 7;

@injectable()
export class LoginUseCase {
	constructor(
		@inject("UserRepository") private readonly userRepository: UserRepository,
		@inject("PasswordHasher") private readonly passwordHasher: PasswordHasher,
		@inject("JwtService") private readonly tokenService: TokenService,
		@inject("RefreshTokenRepository")
		private readonly refreshTokenRepo: RefreshTokenRepository,
	) {}

	async run(
		dto: LoginDto,
	): Promise<{ accessToken: string; refreshToken: string; user: UserDto }> {
		const user = await this.userRepository.findByEmail(dto.email);

		const isPasswordValid = await this.passwordHasher.compare(
			dto.password,
			user?.getPasswordHash() ?? DUMMY_PASSWORD_HASH,
		);

		if (!user || !isPasswordValid) {
			throw new BaseError("Invalid credentials", 401);
		}

		if (!user.getIsActive()) {
			throw new BaseError("User is inactive", 403);
		}

		// Access token de corta duración (15 min)
		const accessToken = this.tokenService.generateToken({
			id: user.getId(),
			email: user.getEmail(),
			role: user.getRole(),
		});

		// Refresh token opaco, persistido como hash en BD
		const rawRefreshToken = this.tokenService.generateRefreshToken();
		const tokenHash = this.tokenService.hashRefreshToken(rawRefreshToken);

		const expiresAt = new Date();
		expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

		await this.refreshTokenRepo.create({
			tokenHash,
			userId: user.getId(),
			expiresAt,
		});

		return {
			accessToken,
			refreshToken: rawRefreshToken,
			user: UserMapper.toDto(user),
		};
	}
}
