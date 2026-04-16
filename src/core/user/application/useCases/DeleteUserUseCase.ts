import { injectable, inject } from "tsyringe";
import { UserNotFoundError } from "../../domain/error/UserNotFoundError";
import type { UserRepository } from "../../domain/repository/UserRepository";

@injectable()
export class DeleteUserUseCase {
  constructor(
    @inject("UserRepository") private readonly userRepository: UserRepository,
  ) {}

  async run(id: number) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new UserNotFoundError();
    }
    await this.userRepository.delete(id);
  }
}
