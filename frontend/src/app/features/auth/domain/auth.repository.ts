import { Observable } from 'rxjs';
import { AuthSession, AuthUser, Credentials } from './auth.models';

/** Port: how the app talks to the authentication backend. */
export abstract class AuthRepository {
  abstract login(credentials: Credentials): Observable<AuthSession>;
  abstract me(): Observable<AuthUser>;
}

/** Port: where the session (JWT) is persisted on the client. */
export abstract class SessionStorage {
  abstract read(): AuthSession | null;
  abstract write(session: AuthSession): void;
  abstract clear(): void;
}
