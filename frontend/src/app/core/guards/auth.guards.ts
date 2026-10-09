import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthFacade } from '../../features/auth/application/auth.facade';

/** Only lets authenticated users through; otherwise redirects to /login. */
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthFacade);
  if (auth.isAuthenticated()) {
    return true;
  }
  auth.logout();
  return inject(Router).createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url },
  });
};

/** Keeps authenticated users away from the login screen. */
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthFacade);
  return auth.isAuthenticated() ? inject(Router).createUrlTree(['/dashboard']) : true;
};
