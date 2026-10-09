import { UnauthorizedError } from '../domain/errors.js';
import { toUserProfile, type UserProfile } from '../domain/user.entity.js';
import type { UserRepository } from '../domain/user.repository.js';

export class GetCurrentUserUseCase {
  constructor(private readonly users: UserRepository) {}

  async execute(userId: string): Promise<UserProfile> {
    const user = await this.users.findById(userId);
    if (!user) {
      throw new UnauthorizedError('El usuario de la sesión ya no existe');
    }
    return toUserProfile(user);
  }
}
