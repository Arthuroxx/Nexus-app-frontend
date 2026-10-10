import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { AuthGateway } from '@features/auth/domain/ports/auth-gateway';
import { HttpAuthGateway } from '@features/auth/infrastructure/http-auth-gateway';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(),
    provideRouter(routes, withViewTransitions()),
    { provide: AuthGateway, useExisting: HttpAuthGateway },
  ],
};
