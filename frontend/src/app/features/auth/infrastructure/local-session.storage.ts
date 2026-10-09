import { Injectable } from '@angular/core';
import { AuthSession } from '../domain/auth.models';
import { SessionStorage } from '../domain/auth.repository';

const TOKEN_KEY = 'access_token';
const SESSION_KEY = 'auth_session';

/** Reads `exp` from the JWT payload (no signature check: the API does that). */
function readJwtExpiration(token: string): number | null {
  try {
    const payload = token.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const exp = (JSON.parse(json) as { exp?: number }).exp;
    return typeof exp === 'number' ? exp * 1000 : null;
  } catch {
    return null;
  }
}

@Injectable()
export class LocalSessionStorage extends SessionStorage {
  read(): AuthSession | null {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const raw = localStorage.getItem(SESSION_KEY);
      if (!token || !raw) {
        return null;
      }
      const session = JSON.parse(raw) as AuthSession;
      const jwtExpiresAt = readJwtExpiration(token);
      return {
        ...session,
        accessToken: token,
        expiresAt: jwtExpiresAt ?? session.expiresAt,
      };
    } catch {
      return null;
    }
  }

  write(session: AuthSession): void {
    localStorage.setItem(TOKEN_KEY, session.accessToken);
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ expiresAt: session.expiresAt, user: session.user }),
    );
  }

  clear(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(SESSION_KEY);
  }
}
