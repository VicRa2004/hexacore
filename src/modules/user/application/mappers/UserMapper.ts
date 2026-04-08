import { User } from "../../domain/User";
import { UserDto } from "../dtos/UserDto";

export class UserMapper {
  public static toDto(user: User): UserDto {
    return {
      id: user.getId(),
      name: user.getName(),
      email: user.getEmail(),
      isActive: user.getIsActive(),
    };
  }
}
