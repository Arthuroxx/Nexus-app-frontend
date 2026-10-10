import { Service, inject } from '@angular/core';
import { AuthenticationOutcome } from '@features/auth/domain/models/authentication-outcome';
import { LoginCredentials } from '@features/auth/domain/models/login-credentials';
import { RegisterCredentials } from '@features/auth/domain/models/register-credentials';
import { AuthGateway } from '@features/auth/domain/ports/auth-gateway';

@Service()
export class AuthService {
  private readonly gateway = inject(AuthGateway);

  signIn(credentials: LoginCredentials): Promise<AuthenticationOutcome> {
    return this.gateway.authenticate(credentials);
  }

  signUp(credentials: RegisterCredentials): Promise<AuthenticationOutcome> {
    return this.gateway.register(credentials);
  }
}
