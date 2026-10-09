import type { PasswordHasher } from '../domain/security.ports.js';
import type { UserRepository } from '../domain/user.repository.js';

export interface SeedAdminCommand {
  username?: string;
  password?: string;
  displayName: string;
}

/** Creates the initial admin user only when there are no users yet. */
export class SeedAdminUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher
  ) {}

  async execute({ username, password, displayName }: SeedAdminCommand): Promise<boolean> {
    if (!username || !password) {
      return false;
    }
    if ((await this.users.count()) > 0) {
      return false;
    }
    await this.users.create({
      username: username.trim().toLowerCase(),
      displayName,
      passwordHash: await this.hasher.hash(password),
    });
    return true;
  }
}
