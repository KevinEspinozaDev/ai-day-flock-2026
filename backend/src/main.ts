import { GetCurrentUserUseCase } from './application/get-current-user.use-case.js';
import { LoginUseCase } from './application/login.use-case.js';
import { SeedAdminUseCase } from './application/seed-admin.use-case.js';
import { loadEnv } from './config/env.js';
import { runMigrations } from './infrastructure/database/migrations.js';
import { createPool } from './infrastructure/database/pg-pool.js';
import { PgUserRepository } from './infrastructure/repositories/pg-user.repository.js';
import { BcryptPasswordHasher } from './infrastructure/security/bcrypt-password-hasher.js';
import { JwtTokenService } from './infrastructure/security/jwt-token-service.js';
import { createApp } from './interfaces/http/app.js';

/** Composition root: wires infrastructure adapters into the use cases. */
async function bootstrap(): Promise<void> {
  const env = loadEnv();
  const pool = createPool(env.DATABASE_URL, env.DATABASE_SSL);
  await runMigrations(pool);

  const users = new PgUserRepository(pool);
  const hasher = new BcryptPasswordHasher();
  const tokens = new JwtTokenService(env.JWT_SECRET, env.JWT_EXPIRES_IN);

  const seeded = await new SeedAdminUseCase(users, hasher).execute({
    username: env.SEED_ADMIN_USERNAME,
    password: env.SEED_ADMIN_PASSWORD,
    displayName: env.SEED_ADMIN_DISPLAY_NAME,
  });
  if (seeded) {
    console.log(`Usuario inicial "${env.SEED_ADMIN_USERNAME}" creado`);
  }

  const app = createApp({
    login: new LoginUseCase(users, hasher, tokens),
    getCurrentUser: new GetCurrentUserUseCase(users),
    tokens,
    corsOrigins: env.CORS_ORIGIN,
    healthCheck: async () => {
      await pool.query('SELECT 1');
    },
  });

  const server = app.listen(env.PORT, () => {
    console.log(`API escuchando en el puerto ${env.PORT}`);
    console.log(`CORS habilitado para: ${env.CORS_ORIGIN.join(', ')}`);
  });

  const shutdown = () => {
    server.close(() => void pool.end().then(() => process.exit(0)));
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
