import { injectable, inject } from "tsyringe";
import { TOKENS } from "@/core/shared/application/tokens";
import type { UpdateUserDto } from "../dtos/UpdateUserDto";
import type { UserDto } from "../dtos/UserDto";
import type { UserRepository } from "../../domain/repository/UserRepository";
import type { PasswordHasher } from "../../domain/service/PasswordHasher";
import { UserMapper } from "../mappers/UserMapper";
import { UserNotFoundError } from "../../domain/error/UserNotFoundError";

@injectable()
export class UpdateUserUseCase {
	constructor(
		@inject(TOKENS.UserRepository)
		private readonly userRepository: UserRepository,
		@inject(TOKENS.PasswordHasher)
		private readonly passwordHasher: PasswordHasher,
	) {}

	async run(id: number, dto: UpdateUserDto): Promise<UserDto> {
		const user = await this.userRepository.findById(id);
		if (!user) {
			throw new UserNotFoundError();
		}

		user.update({
			name: dto.name,
			email: dto.email,
			passwordHash: dto.password
				? await this.passwordHasher.hash(dto.password)
				: undefined,
		});

		const updatedUser = await this.userRepository.update(user);
		return UserMapper.toDto(updatedUser);
	}
}
