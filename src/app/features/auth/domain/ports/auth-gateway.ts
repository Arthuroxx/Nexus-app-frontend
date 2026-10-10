import { AuthenticationOutcome } from '@features/auth/domain/models/authentication-outcome';
import { LoginCredentials } from '@features/auth/domain/models/login-credentials';
import { RegisterCredentials } from '@features/auth/domain/models/register-credentials';

export abstract class AuthGateway {
  abstract authenticate(credentials: LoginCredentials): Promise<AuthenticationOutcome>;

  abstract register(credentials: RegisterCredentials): Promise<AuthenticationOutcome>;
}
