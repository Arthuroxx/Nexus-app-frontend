export interface AuthenticatedUser {
  readonly email: string;
  readonly displayName: string;
}

export type AuthenticationOutcome =
  | { readonly kind: 'authenticated'; readonly user: AuthenticatedUser }
  | { readonly kind: 'rejected'; readonly message: string };
