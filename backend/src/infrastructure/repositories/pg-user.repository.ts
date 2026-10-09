import type pg from 'pg';
import type { User } from '../../domain/user.entity.js';
import type { NewUser, UserRepository } from '../../domain/user.repository.js';

interface UserRow {
  id: string;
  username: string;
  display_name: string;
  password_hash: string;
  created_at: Date;
}

const COLUMNS = 'id, username, display_name, password_hash, created_at';

function toEntity(row: UserRow): User {
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    passwordHash: row.password_hash,
    createdAt: row.created_at,
  };
}

export class PgUserRepository implements UserRepository {
  constructor(private readonly pool: pg.Pool) {}

  async findByUsername(username: string): Promise<User | null> {
    const { rows } = await this.pool.query<UserRow>(
      `SELECT ${COLUMNS} FROM users WHERE username = $1`,
      [username]
    );
    return rows[0] ? toEntity(rows[0]) : null;
  }

  async findById(id: string): Promise<User | null> {
    const { rows } = await this.pool.query<UserRow>(
      `SELECT ${COLUMNS} FROM users WHERE id::text = $1`,
      [id]
    );
    return rows[0] ? toEntity(rows[0]) : null;
  }

  async count(): Promise<number> {
    const { rows } = await this.pool.query<{ total: string }>(
      'SELECT COUNT(*)::text AS total FROM users'
    );
    return Number(rows[0]?.total ?? 0);
  }

  async create(user: NewUser): Promise<User> {
    const { rows } = await this.pool.query<UserRow>(
      `INSERT INTO users (username, display_name, password_hash)
       VALUES ($1, $2, $3)
       RETURNING ${COLUMNS}`,
      [user.username, user.displayName, user.passwordHash]
    );
    return toEntity(rows[0]!);
  }
}
