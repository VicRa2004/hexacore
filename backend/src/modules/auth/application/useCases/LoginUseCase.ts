import { injectable, inject } from "tsyringe";
import { TOKENS } from "@/core/shared/application/tokens";
import type { LoginDto } from "../dtos/LoginDto";
import { BaseError } from "@/core/shared/domain/error/BaseError";
import type { UserRepository } from "@/core/user";
import type { PasswordHasher } from "@/core/user";
import { SessionIssuer } from "../services/SessionIssuer";
import type { UserDto } from "@/core/user";
import { UserMapper } from "@/core/user";

/**
 * Hash bcrypt de una contraseña aleatoria: si el email no existe se compara
 * igualmente contra él, para que la respuesta tarde lo mismo.
 */
const DUMMY_PASSWORD_HASH =
	"$2b$10$UZQKZ7yo9nGiqhSbmYdj4eV9jrthslRlUx4lX.r5eMN.sW4Pb.boi";

@injectable()
export class LoginUseCase {
	constructor(
		@inject(TOKENS.UserRepository)
		private readonly userRepository: UserRepository,
		@inject(TOKENS.PasswordHasher)
		private readonly passwordHasher: PasswordHasher,
		private readonly sessionIssuer: SessionIssuer,
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

		return {
			...(await this.sessionIssuer.issue(user)),
			user: UserMapper.toDto(user),
		};
	}
}
