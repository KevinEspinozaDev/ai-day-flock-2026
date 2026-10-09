import { computed, inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { AuthSession, Credentials, isSessionValid } from '../domain/auth.models';
import { AuthRepository, SessionStorage } from '../domain/auth.repository';

/**
 * Application service for authentication. Components only talk to this facade,
 * never to the HTTP adapter or the storage directly.
 */
@Injectable({ providedIn: 'root' })
export class AuthFacade {
  private readonly repository = inject(AuthRepository);
  private readonly storage = inject(SessionStorage);
  private readonly logoutHandlers: Array<() => void> = [];

  private readonly session = signal<AuthSession | null>(this.storage.read());

  readonly user = computed(() => this.session()?.user ?? null);
  readonly accessToken = computed(() => this.session()?.accessToken ?? null);

  isAuthenticated(): boolean {
    return isSessionValid(this.session());
  }

  login(credentials: Credentials): Observable<AuthSession> {
    return this.repository.login(credentials).pipe(
      tap((session) => {
        this.storage.write(session);
        this.session.set(session);
      }),
    );
  }

  /** Removes the JWT and any user data kept on the client. */
  logout(): void {
    this.storage.clear();
    this.session.set(null);
    this.logoutHandlers.forEach((handler) => handler());
  }

  /** Lets other features clean their own state when the session ends. */
  onLogout(handler: () => void): void {
    this.logoutHandlers.push(handler);
  }
}
