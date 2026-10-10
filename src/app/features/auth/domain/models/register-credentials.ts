export interface RegisterCredentials {
  readonly name: string;
  readonly email: string;
  readonly password: string;
  readonly confirmPassword: string;
  readonly acceptTerms: boolean;
}
