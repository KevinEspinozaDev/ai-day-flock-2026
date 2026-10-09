import { Provider } from '@angular/core';
import { AuthRepository, SessionStorage } from './domain/auth.repository';
import { HttpAuthRepository } from './infrastructure/http-auth.repository';
import { LocalSessionStorage } from './infrastructure/local-session.storage';

/** Binds the auth ports to their infrastructure adapters. */
export const authProviders: Provider[] = [
  { provide: AuthRepository, useClass: HttpAuthRepository },
  { provide: SessionStorage, useClass: LocalSessionStorage },
];
