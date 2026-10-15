import { Component, computed, input } from '@angular/core';
import { LastWorkoutView } from '@features/home/domain/models/home-view';
import { formatSessionDate, formatVolumeKg } from '@features/home/presentation/utils/home-format';

@Component({
  selector: 'app-last-workout-card',
  templateUrl: './last-workout-card.html',
  styleUrls: ['../home-card.css'],
})
export class LastWorkoutCard {
  readonly workout = input<LastWorkoutView | null>(null);

  protected readonly formattedDate = computed(() => {
    const workout = this.workout();
    return workout ? formatSessionDate(workout.finishedAt) : '';
  });

  protected readonly volume = computed(() => {
    const workout = this.workout();
    return workout ? formatVolumeKg(workout.volumeKg) : '';
  });
}
