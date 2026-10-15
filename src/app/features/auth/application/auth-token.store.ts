import { Service, signal } from '@angular/core';

const STORAGE_KEY = 'nexus.access-token';

@Service()
export class AuthTokenStore {
  private readonly token = signal<string | null>(this.restore());

  readonly accessToken = this.token.asReadonly();

  save(accessToken: string): void {
    this.token.set(accessToken);
    this.persist(accessToken);
  }

  clear(): void {
    this.token.set(null);
    this.persist(null);
  }

  private restore(): string | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  }

  private persist(accessToken: string | null): void {
    if (typeof localStorage === 'undefined') {
      return;
    }
    try {
      if (accessToken === null) {
        localStorage.removeItem(STORAGE_KEY);
        return;
      }
      localStorage.setItem(STORAGE_KEY, accessToken);
    } catch {
      return;
    }
  }
}
