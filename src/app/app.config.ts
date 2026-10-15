import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { AuthGateway } from '@features/auth/domain/ports/auth-gateway';
import { authTokenInterceptor } from '@features/auth/infrastructure/auth-token.interceptor';
import { HttpAuthGateway } from '@features/auth/infrastructure/http-auth-gateway';
import { HomeGateway } from '@features/home/domain/ports/home-gateway';
import { HttpHomeGateway } from '@features/home/infrastructure/http-home-gateway';
import { RoutinesGateway } from '@features/routines/domain/ports/routines-gateway';
import { HttpRoutinesGateway } from '@features/routines/infrastructure/http-routines-gateway';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptors([authTokenInterceptor])),
    provideRouter(routes, withViewTransitions()),
    { provide: AuthGateway, useExisting: HttpAuthGateway },
    { provide: HomeGateway, useExisting: HttpHomeGateway },
    { provide: RoutinesGateway, useExisting: HttpRoutinesGateway },
  ],
};
