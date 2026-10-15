export interface AuthenticatedUser {
  readonly email: string;
  readonly displayName: string;
}

export type AuthenticationOutcome =
  | {
      readonly kind: 'authenticated';
      readonly user: AuthenticatedUser;
      readonly accessToken: string;
    }
  | { readonly kind: 'rejected'; readonly message: string };
