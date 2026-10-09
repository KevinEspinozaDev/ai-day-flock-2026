import type { User } from './user.entity.js';

export interface NewUser {
  username: string;
  displayName: string;
  passwordHash: string;
}

export interface UserRepository {
  findByUsername(username: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  count(): Promise<number>;
  create(user: NewUser): Promise<User>;
}
