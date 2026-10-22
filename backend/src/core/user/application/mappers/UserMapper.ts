import type { User } from "../../domain/User";
import type { UserDto } from "../dtos/UserDto";

export const UserMapper = {
	toDto(user: User): UserDto {
		return {
			id: user.getId(),
			name: user.getName(),
			email: user.getEmail(),
			isActive: user.getIsActive(),
			roles: user.getRoles(),
		};
	},
};
