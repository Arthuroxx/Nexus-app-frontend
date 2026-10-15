import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthTokenStore } from '@features/auth/application/auth-token.store';

export const authGuard: CanActivateFn = () => {
  const tokenStore = inject(AuthTokenStore);
  const router = inject(Router);

  if (tokenStore.accessToken() !== null) {
    return true;
  }

  return router.createUrlTree(['/']);
};
