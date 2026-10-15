import { HomeView } from '@features/home/domain/models/home-view';

export abstract class HomeGateway {
  abstract loadDashboard(): Promise<HomeView>;
}
