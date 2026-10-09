import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import { GetCurrentUserUseCase } from '../src/application/get-current-user.use-case.js';
import { LoginUseCase } from '../src/application/login.use-case.js';
import { SeedAdminUseCase } from '../src/application/seed-admin.use-case.js';
import type { User } from '../src/domain/user.entity.js';
import type { NewUser, UserRepository } from '../src/domain/user.repository.js';
import { BcryptPasswordHasher } from '../src/infrastructure/security/bcrypt-password-hasher.js';
import { JwtTokenService } from '../src/infrastructure/security/jwt-token-service.js';
import { createApp } from '../src/interfaces/http/app.js';

class InMemoryUserRepository implements UserRepository {
  private readonly users: User[] = [];

  async findByUsername(username: string) {
    return this.users.find((u) => u.username === username) ?? null;
  }
  async findById(id: string) {
    return this.users.find((u) => u.id === id) ?? null;
  }
  async count() {
    return this.users.length;
  }
  async create(user: NewUser) {
    const created: User = { ...user, id: String(this.users.length + 1), createdAt: new Date() };
    this.users.push(created);
    return created;
  }
}

describe('auth API', () => {
  const users = new InMemoryUserRepository();
  const hasher = new BcryptPasswordHasher(4);
  const tokens = new JwtTokenService('x'.repeat(40), '1h');
  const app = createApp({
    login: new LoginUseCase(users, hasher, tokens),
    getCurrentUser: new GetCurrentUserUseCase(users),
    tokens,
    corsOrigins: ['http://localhost:4200'],
  });

  beforeAll(async () => {
    const seed = new SeedAdminUseCase(users, hasher);
    expect(await seed.execute({ username: 'Admin', password: 'secret123', displayName: 'Admin' })).toBe(true);
    expect(await seed.execute({ username: 'other', password: 'x', displayName: 'Other' })).toBe(false);
  });

  it('returns a JWT and the profile on valid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({ username: 'admin', password: 'secret123' });
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeTypeOf('string');
    expect(res.body.expiresIn).toBe(3600);
    expect(res.body.user).toEqual({ id: '1', username: 'admin', displayName: 'Admin' });
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  it('rejects wrong password and unknown users with the same error', async () => {
    const wrong = await request(app).post('/api/auth/login').send({ username: 'admin', password: 'nope' });
    const unknown = await request(app).post('/api/auth/login').send({ username: 'ghost', password: 'nope' });
    expect(wrong.status).toBe(401);
    expect(unknown.status).toBe(401);
    expect(wrong.body).toEqual(unknown.body);
  });

  it('validates the request body', async () => {
    const res = await request(app).post('/api/auth/login').send({ username: '' });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('protects /me with the bearer token', async () => {
    const login = await request(app).post('/api/auth/login').send({ username: 'admin', password: 'secret123' });
    const ok = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${login.body.accessToken}`);
    expect(ok.status).toBe(200);
    expect(ok.body.username).toBe('admin');

    const missing = await request(app).get('/api/auth/me');
    const tampered = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${login.body.accessToken}x`);
    expect(missing.status).toBe(401);
    expect(tampered.status).toBe(401);
  });
});
