import { Service, inject, signal } from '@angular/core';
import { HomeView } from '@features/home/domain/models/home-view';
import { HomeGateway } from '@features/home/domain/ports/home-gateway';

@Service()
export class HomeService {
  private readonly gateway = inject(HomeGateway);

  private readonly dashboardState = signal<HomeView | null>(null);
  private readonly loadingState = signal(false);
  private readonly errorState = signal<string | null>(null);

  readonly dashboard = this.dashboardState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly error = this.errorState.asReadonly();

  async load(): Promise<void> {
    this.loadingState.set(true);
    this.errorState.set(null);

    try {
      this.dashboardState.set(await this.gateway.loadDashboard());
    } catch {
      this.errorState.set('No se pudo cargar tu panel. Inténtalo de nuevo.');
    } finally {
      this.loadingState.set(false);
    }
  }
}
