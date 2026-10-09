import { InvalidCredentialsError } from '../domain/errors.js';
import type { IssuedToken, PasswordHasher, TokenService } from '../domain/security.ports.js';
import { toUserProfile, type UserProfile } from '../domain/user.entity.js';
import type { UserRepository } from '../domain/user.repository.js';

export interface LoginCommand {
  username: string;
  password: string;
}

export interface LoginResult extends IssuedToken {
  user: UserProfile;
}

/** A valid bcrypt hash used to keep response timing similar when the user does not exist. */
const DUMMY_HASH =
  '$2b$10$v9.9suzxfJSdAt8AGIBBou9cdMpQqlho80UQBk9JJ5ooNW3oCH3oa';

export class LoginUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher,
    private readonly tokens: TokenService
  ) {}

  async execute({ username, password }: LoginCommand): Promise<LoginResult> {
    const user = await this.users.findByUsername(username.trim().toLowerCase());
    const valid = await this.hasher.compare(password, user?.passwordHash ?? DUMMY_HASH);

    if (!user || !valid) {
      throw new InvalidCredentialsError();
    }

    const token = this.tokens.sign({ sub: user.id, username: user.username });
    return { ...token, user: toUserProfile(user) };
  }
}
