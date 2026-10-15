import { Service, inject, signal } from '@angular/core';
import {
  AuthenticatedUser,
  AuthenticationOutcome,
} from '@features/auth/domain/models/authentication-outcome';
import { LoginCredentials } from '@features/auth/domain/models/login-credentials';
import { RegisterCredentials } from '@features/auth/domain/models/register-credentials';
import { AuthGateway } from '@features/auth/domain/ports/auth-gateway';
import { AuthTokenStore } from '@features/auth/application/auth-token.store';

@Service()
export class AuthService {
  private readonly gateway = inject(AuthGateway);
  private readonly tokenStore = inject(AuthTokenStore);

  private readonly session = signal<AuthenticatedUser | null>(null);
  readonly currentUser = this.session.asReadonly();

  async signIn(credentials: LoginCredentials): Promise<AuthenticationOutcome> {
    const outcome = await this.gateway.authenticate(credentials);
    this.establishSession(outcome);
    return outcome;
  }

  async signUp(credentials: RegisterCredentials): Promise<AuthenticationOutcome> {
    const outcome = await this.gateway.register(credentials);
    this.establishSession(outcome);
    return outcome;
  }

  signOut(): void {
    this.session.set(null);
    this.tokenStore.clear();
  }

  private establishSession(outcome: AuthenticationOutcome): void {
    if (outcome.kind === 'authenticated') {
      this.session.set(outcome.user);
      this.tokenStore.save(outcome.accessToken);
    }
  }
}
