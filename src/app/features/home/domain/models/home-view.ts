export type WeekStatus = 'DONE' | 'TODAY' | 'PLANNED' | 'REST';

export type RoutineIntensity = 'BAJA' | 'MEDIA' | 'ALTA';

export interface WeekDayView {
  /** Fecha ISO (yyyy-mm-dd). */
  readonly date: string;
  /** Dia ISO: 1 = lunes ... 7 = domingo. */
  readonly weekday: number;
  readonly status: WeekStatus;
  readonly minutes: number;
}

export interface WeekProgressView {
  readonly done: number;
  readonly planned: number;
}

export interface HomeStatsView {
  readonly weekVolumeKg: number;
  readonly weekActiveMinutes: number;
  readonly personalRecordsThisMonth: number;
}

export interface RoutineSummaryView {
  readonly id: string;
  readonly name: string;
  readonly description: string | null;
  readonly focusTag: string | null;
  readonly intensity: RoutineIntensity;
  readonly estimatedMinutes: number;
  readonly scheduledDays: readonly number[];
  readonly exerciseCount: number;
  readonly lastDoneAt: string | null;
}

export interface LastWorkoutView {
  readonly sessionId: string;
  readonly routineId: string | null;
  readonly name: string;
  /** Fecha ISO del `finished_at`. */
  readonly finishedAt: string;
  readonly durationMinutes: number;
  readonly volumeKg: number;
}

export interface HomeView {
  readonly todayWorkout: RoutineSummaryView | null;
  readonly lastWorkout: LastWorkoutView | null;
  readonly week: readonly WeekDayView[];
  readonly weekProgress: WeekProgressView;
  readonly streakWeeks: number;
  readonly stats: HomeStatsView;
}
