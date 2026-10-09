import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthFacade } from '../../features/auth/application/auth.facade';
import { APP_CONFIG } from '../config/app-config';

/** Adds the bearer token to API calls and closes the session on 401. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthFacade);
  const router = inject(Router);
  const { apiUrl } = inject(APP_CONFIG);

  const token = auth.accessToken();
  const isApiCall = req.url.startsWith(apiUrl);
  const request =
    token && isApiCall
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

  return next(request).pipe(
    catchError((error: unknown) => {
      if (isApiCall && error instanceof HttpErrorResponse && error.status === 401 && token) {
        auth.logout();
        void router.navigate(['/login'], { queryParams: { reason: 'expired' } });
      }
      return throwError(() => error);
    }),
  );
};
