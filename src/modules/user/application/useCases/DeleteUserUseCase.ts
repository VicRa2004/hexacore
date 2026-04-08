import { UserNotFoundError } from "../../domain/error/UserNotFoundError";
import { UserRepository } from "../../domain/repository/UserRepository";

export class DeleteUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async run(id: number) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new UserNotFoundError();
    }
    await this.userRepository.delete(id);
  }
}
