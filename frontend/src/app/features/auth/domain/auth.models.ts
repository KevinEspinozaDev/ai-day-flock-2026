export interface AuthUser {
  id: string;
  username: string;
  displayName: string;
}

export interface Credentials {
  username: string;
  password: string;
}

export interface AuthSession {
  accessToken: string;
  /** Expiration as epoch milliseconds. */
  expiresAt: number;
  user: AuthUser;
}

export function isSessionValid(session: AuthSession | null, now = Date.now()): boolean {
  return !!session && session.expiresAt > now;
}
