import jwt, { type SignOptions } from 'jsonwebtoken';
import { UnauthorizedError } from '../../domain/errors.js';
import type { IssuedToken, TokenPayload, TokenService } from '../../domain/security.ports.js';

const ISSUER = 'ai-day-flock-2026';

export class JwtTokenService implements TokenService {
  constructor(
    private readonly secret: string,
    private readonly expiresIn: string
  ) {}

  sign(payload: TokenPayload): IssuedToken {
    const accessToken = jwt.sign({ username: payload.username }, this.secret, {
      subject: payload.sub,
      issuer: ISSUER,
      algorithm: 'HS256',
      expiresIn: this.expiresIn as SignOptions['expiresIn'],
    });
    const decoded = jwt.decode(accessToken) as jwt.JwtPayload;
    const expiresIn = (decoded.exp ?? 0) - (decoded.iat ?? 0);
    return { accessToken, expiresIn };
  }

  verify(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, this.secret, {
        issuer: ISSUER,
        algorithms: ['HS256'],
      }) as jwt.JwtPayload;
      if (!decoded.sub || typeof decoded['username'] !== 'string') {
        throw new UnauthorizedError();
      }
      return { sub: decoded.sub, username: decoded['username'] };
    } catch {
      throw new UnauthorizedError();
    }
  }
}
