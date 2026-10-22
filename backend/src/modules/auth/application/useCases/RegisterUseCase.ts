import { injectable, inject } from "tsyringe";
import type { RegisterDto } from "../dtos/RegisterDto";
import { BaseError } from "@/core/shared/domain/error/BaseError";
import type { UserRepository } from "@/core/user";
import type { PasswordHasher } from "@/core/user";
import { User } from "@/core/user";
import type { TokenService } from "../../domain/service/TokenService";
import type { RefreshTokenRepository } from "../../domain/repository/RefreshTokenRepository";
import type { UserDto } from "@/core/user";
import { UserMapper } from "@/core/user";

/** Duración del refresh token: 7 días */
const REFRESH_TOKEN_EXPIRY_DAYS = 7;

@injectable()
export class RegisterUseCase {
	constructor(
		@inject("UserRepository") private readonly userRepository: UserRepository,
		@inject("PasswordHasher") private readonly passwordHasher: PasswordHasher,
		@inject("JwtService") private readonly tokenService: TokenService,
		@inject("RefreshTokenRepository")
		private readonly refreshTokenRepo: RefreshTokenRepository,
	) {}

	async run(
		dto: RegisterDto,
	): Promise<{ accessToken: string; refreshToken: string; user: UserDto }> {
		const existingUser = await this.userRepository.findByEmail(dto.email);
		if (existingUser) {
			throw new BaseError("User with this email already exists", 400);
		}

		const passwordHash = await this.passwordHasher.hash(dto.password);
		// Role comes as 'USER' by default in user create
		const user = User.create(dto.name, dto.email, passwordHash, "USER");

		const createdUser = await this.userRepository.create(user);

		// Access token de corta duración (15 min)
		const accessToken = this.tokenService.generateToken({
			id: createdUser.getId(),
			email: createdUser.getEmail(),
			role: createdUser.getRole(),
		});

		// Refresh token opaco, persistido como hash en BD
		const rawRefreshToken = this.tokenService.generateRefreshToken();
		const tokenHash = this.tokenService.hashRefreshToken(rawRefreshToken);

		const expiresAt = new Date();
		expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

		await this.refreshTokenRepo.create({
			tokenHash,
			userId: createdUser.getId(),
			expiresAt,
		});

		return {
			accessToken,
			refreshToken: rawRefreshToken,
			user: UserMapper.toDto(createdUser),
		};
	}
}
