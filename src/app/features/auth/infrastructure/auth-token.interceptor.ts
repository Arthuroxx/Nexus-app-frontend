import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthTokenStore } from '@features/auth/application/auth-token.store';

export const authTokenInterceptor: HttpInterceptorFn = (request, next) => {
  const accessToken = inject(AuthTokenStore).accessToken();

  if (!accessToken) {
    return next(request);
  }

  return next(
    request.clone({
      setHeaders: { Authorization: `Bearer ${accessToken}` },
    }),
  );
};
