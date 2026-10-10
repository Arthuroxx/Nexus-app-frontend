import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '@env/environment';
import { AuthenticationOutcome } from '@features/auth/domain/models/authentication-outcome';
import { LoginCredentials } from '@features/auth/domain/models/login-credentials';
import { RegisterCredentials } from '@features/auth/domain/models/register-credentials';
import { AuthGateway } from '@features/auth/domain/ports/auth-gateway';

interface TokenResponse {
  readonly access_token: string;
}

interface ProblemDetails {
  readonly detail?: string;
}

@Service()
export class HttpAuthGateway extends AuthGateway {
  private readonly http = inject(HttpClient);

  async authenticate(credentials: LoginCredentials): Promise<AuthenticationOutcome> {
    try {
      await firstValueFrom(
        this.http.post<TokenResponse>(`${environment.apiUrl}/auth/login`, {
          email: credentials.email,
          password: credentials.password,
        }),
      );
      return this.authenticated(credentials.email, this.deriveName(credentials.email));
    } catch (error) {
      return { kind: 'rejected', message: this.toMessage(error) };
    }
  }

  async register(credentials: RegisterCredentials): Promise<AuthenticationOutcome> {
    try {
      await firstValueFrom(
        this.http.post<TokenResponse>(`${environment.apiUrl}/auth/register`, {
          email: credentials.email,
          password: credentials.password,
          name: credentials.name,
        }),
      );
      const displayName = credentials.name.trim() || this.deriveName(credentials.email);
      return this.authenticated(credentials.email, displayName);
    } catch (error) {
      return { kind: 'rejected', message: this.toMessage(error) };
    }
  }

  private authenticated(email: string, displayName: string): AuthenticationOutcome {
    return { kind: 'authenticated', user: { email, displayName } };
  }

  private deriveName(email: string): string {
    const [localPart] = email.split('@');
    return localPart && localPart.length > 0 ? localPart : 'Nexus';
  }

  private toMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        return 'No se pudo conectar con el servidor. Verifica que el backend esté en línea.';
      }
      const detail = (error.error as ProblemDetails | null)?.detail;
      if (typeof detail === 'string' && detail.trim().length > 0) {
        return detail;
      }
      return 'No se pudo completar la solicitud. Inténtalo de nuevo.';
    }
    return 'Ocurrió un error inesperado. Inténtalo de nuevo.';
  }
}
