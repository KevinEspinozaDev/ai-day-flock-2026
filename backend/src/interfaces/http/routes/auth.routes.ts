import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { z } from 'zod';
import type { GetCurrentUserUseCase } from '../../../application/get-current-user.use-case.js';
import type { LoginUseCase } from '../../../application/login.use-case.js';
import type { TokenService } from '../../../domain/security.ports.js';
import { type AuthenticatedRequest, requireAuth } from '../middlewares/auth.middleware.js';

const loginSchema = z.object({
  username: z.string().trim().min(1, 'El usuario es obligatorio').max(80),
  password: z.string().min(1, 'La contraseña es obligatoria').max(200),
});

export interface AuthRoutesDeps {
  login: LoginUseCase;
  getCurrentUser: GetCurrentUserUseCase;
  tokens: TokenService;
}

export function authRoutes({ login, getCurrentUser, tokens }: AuthRoutesDeps): Router {
  const router = Router();

  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { code: 'TOO_MANY_ATTEMPTS', message: 'Demasiados intentos, probá más tarde' },
  });

  router.post('/login', loginLimiter, async (req, res) => {
    const command = loginSchema.parse(req.body);
    res.json(await login.execute(command));
  });

  router.get('/me', requireAuth(tokens), async (req: AuthenticatedRequest, res) => {
    res.json(await getCurrentUser.execute(req.auth!.sub));
  });

  return router;
}
