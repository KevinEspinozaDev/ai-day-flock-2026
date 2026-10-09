import type { NextFunction, Request, Response } from 'express';
import { UnauthorizedError } from '../../../domain/errors.js';
import type { TokenPayload, TokenService } from '../../../domain/security.ports.js';

export interface AuthenticatedRequest extends Request {
  auth?: TokenPayload;
}

export function requireAuth(tokens: TokenService) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    const header = req.headers.authorization ?? '';
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) {
      next(new UnauthorizedError('Falta el token de acceso'));
      return;
    }
    try {
      req.auth = tokens.verify(token);
      next();
    } catch (error) {
      next(error);
    }
  };
}
