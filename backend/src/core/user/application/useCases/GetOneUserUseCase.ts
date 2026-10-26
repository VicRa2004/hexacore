import { UserNotFoundError } from "../../domain/error/UserNotFoundError";
import type { UserRepository } from "../../domain/repository/UserRepository";
import type { GetOneUserDto } from "../dtos/GetOneUserDto";
import type { UserDto } from "../dtos/UserDto";
import { UserMapper } from "../mappers/UserMapper";

export class GetOneUserUseCase {
	constructor(private readonly userRepository: UserRepository) {}

	async run(dto: GetOneUserDto): Promise<UserDto> {
		const user = await this.userRepository.findById(dto.id);
		if (!user) {
			throw new UserNotFoundError();
		}
		return UserMapper.toDto(user);
	}
}
