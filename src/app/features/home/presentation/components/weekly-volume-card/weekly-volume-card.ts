import { Component, computed, input } from '@angular/core';
import { HomeStatsView } from '@features/home/domain/models/home-view';
import { formatVolumeKg } from '@features/home/presentation/utils/home-format';

@Component({
  selector: 'app-weekly-volume-card',
  templateUrl: './weekly-volume-card.html',
  styleUrls: ['../home-card.css'],
})
export class WeeklyVolumeCard {
  readonly stats = input<HomeStatsView | null>(null);

  protected readonly volume = computed(() => {
    const stats = this.stats();
    return stats ? formatVolumeKg(stats.weekVolumeKg) : '';
  });
}
