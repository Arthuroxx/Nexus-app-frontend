import { Component, computed, input } from '@angular/core';
import { RoutineIntensity, RoutineSummaryView } from '@features/home/domain/models/home-view';

const INTENSITY_LABELS: Record<RoutineIntensity, string> = {
  BAJA: 'Baja',
  MEDIA: 'Media',
  ALTA: 'Alta',
};

@Component({
  selector: 'app-today-workout-card',
  templateUrl: './today-workout-card.html',
  styleUrls: ['../home-card.css'],
})
export class TodayWorkoutCard {
  readonly workout = input<RoutineSummaryView | null>(null);

  protected readonly intensityLabel = computed(() => {
    const workout = this.workout();
    return workout ? INTENSITY_LABELS[workout.intensity] : '';
  });
}
