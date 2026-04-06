import { UserRepository } from '../../domain/repository/UserRepository';
import { BaseError } from '@/core/shared/domain/error/BaseError';

export class DeleteUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(id: number) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new BaseError('Usuario no encontrado', 404);
    }
    await this.userRepository.delete(id);
  }
}
