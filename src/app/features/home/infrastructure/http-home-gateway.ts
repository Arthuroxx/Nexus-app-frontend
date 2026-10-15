import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '@env/environment';
import { HomeView } from '@features/home/domain/models/home-view';
import { HomeGateway } from '@features/home/domain/ports/home-gateway';

@Service()
export class HttpHomeGateway extends HomeGateway {
  private readonly http = inject(HttpClient);

  async loadDashboard(): Promise<HomeView> {
    return firstValueFrom(this.http.get<HomeView>(`${environment.apiUrl}/api/home`));
  }
}
