import { Service } from '@angular/core';
import { AuthenticationOutcome } from '@features/auth/domain/models/authentication-outcome';
import { LoginCredentials } from '@features/auth/domain/models/login-credentials';
import { RegisterCredentials } from '@features/auth/domain/models/register-credentials';
import { AuthGateway } from '@features/auth/domain/ports/auth-gateway';

const SIMULATED_LATENCY_MS = 650;
const MOCK_ACCESS_TOKEN = 'mock-access-token';

@Service()
export class MockAuthGateway extends AuthGateway {
  async authenticate(credentials: LoginCredentials): Promise<AuthenticationOutcome> {
    await new Promise((resolve) => setTimeout(resolve, SIMULATED_LATENCY_MS));

    const [localPart] = credentials.email.split('@');
    const displayName = localPart && localPart.length > 0 ? localPart : 'Nexus';

    return {
      kind: 'authenticated',
      user: { email: credentials.email, displayName },
      accessToken: MOCK_ACCESS_TOKEN,
    };
  }

  async register(credentials: RegisterCredentials): Promise<AuthenticationOutcome> {
    await new Promise((resolve) => setTimeout(resolve, SIMULATED_LATENCY_MS));

    const displayName = credentials.name.trim().length > 0 ? credentials.name.trim() : 'Nexus';

    return {
      kind: 'authenticated',
      user: { email: credentials.email, displayName },
      accessToken: MOCK_ACCESS_TOKEN,
    };
  }
}
