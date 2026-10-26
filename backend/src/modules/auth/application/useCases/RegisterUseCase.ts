import type { RegisterDto } from "../dtos/RegisterDto";
import { BaseError } from "@/core/shared/domain/error/BaseError";
import type { UserRepository } from "@/core/user";
import type { PasswordHasher } from "@/core/user";
import { User } from "@/core/user";
import { SessionIssuer } from "../services/SessionIssuer";
import type { UserDto } from "@/core/user";
import { UserMapper } from "@/core/user";

export class RegisterUseCase {
	constructor(
		private readonly userRepository: UserRepository,
		private readonly passwordHasher: PasswordHasher,
		private readonly sessionIssuer: SessionIssuer,
	) {}

	async run(
		dto: RegisterDto,
	): Promise<{ accessToken: string; refreshToken: string; user: UserDto }> {
		const existingUser = await this.userRepository.findByEmail(dto.email);
		if (existingUser) {
			throw new BaseError("User with this email already exists", 400);
		}

		const passwordHash = await this.passwordHasher.hash(dto.password);
		const user = User.create(dto.name, dto.email, passwordHash);

		const createdUser = await this.userRepository.create(user);

		return {
			...(await this.sessionIssuer.issue(createdUser)),
			user: UserMapper.toDto(createdUser),
		};
	}
}
