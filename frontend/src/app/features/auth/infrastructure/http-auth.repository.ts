import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { APP_CONFIG } from '../../../core/config/app-config';
import { AuthSession, AuthUser, Credentials } from '../domain/auth.models';
import { AuthRepository } from '../domain/auth.repository';

interface LoginResponseDto {
  accessToken: string;
  expiresIn: number;
  user: AuthUser;
}

@Injectable()
export class HttpAuthRepository extends AuthRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${inject(APP_CONFIG).apiUrl}/api/auth`;

  login(credentials: Credentials): Observable<AuthSession> {
    return this.http.post<LoginResponseDto>(`${this.baseUrl}/login`, credentials).pipe(
      map((dto) => ({
        accessToken: dto.accessToken,
        expiresAt: Date.now() + dto.expiresIn * 1000,
        user: dto.user,
      })),
    );
  }

  me(): Observable<AuthUser> {
    return this.http.get<AuthUser>(`${this.baseUrl}/me`);
  }
}
