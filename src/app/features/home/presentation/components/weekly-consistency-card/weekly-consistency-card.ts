import { Component, computed, input } from '@angular/core';
import { WeekDayView, WeekProgressView, WeekStatus } from '@features/home/domain/models/home-view';

const WEEKDAY_SHORT = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const WEEKDAY_LONG = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const STATUS_LABELS: Record<WeekStatus, string> = {
  DONE: 'Completado',
  TODAY: 'Hoy',
  PLANNED: 'Programado',
  REST: 'Descanso',
};

@Component({
  selector: 'app-weekly-consistency-card',
  templateUrl: './weekly-consistency-card.html',
  styleUrls: ['../home-card.css'],
})
export class WeeklyConsistencyCard {
  readonly week = input<readonly WeekDayView[]>([]);
  readonly progress = input<WeekProgressView>({ done: 0, planned: 0 });
  readonly streakWeeks = input(0);

  protected readonly days = computed(() =>
    this.week().map((day) => ({
      date: day.date,
      status: day.status,
      short: WEEKDAY_SHORT[day.weekday - 1] ?? '',
      long: WEEKDAY_LONG[day.weekday - 1] ?? '',
      statusLabel: STATUS_LABELS[day.status],
    })),
  );

  protected readonly done = computed(() => this.progress().done);
  protected readonly planned = computed(() => this.progress().planned);
  protected readonly completion = computed(() => {
    const planned = this.planned();
    return planned === 0 ? 0 : Math.round((this.done() / planned) * 100);
  });
}
