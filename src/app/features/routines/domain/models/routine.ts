import { MuscleGroup } from '@features/routines/domain/models/exercise';

export type RoutineIntensity = 'BAJA' | 'MEDIA' | 'ALTA';

export const ROUTINE_INTENSITIES: readonly RoutineIntensity[] = ['BAJA', 'MEDIA', 'ALTA'];

export interface RoutineItem {
  readonly id: string;
  readonly exerciseId: string;
  readonly position: number;
  readonly sets: number;
  readonly reps: number;
  readonly loadKg: number | null;
  readonly loadNote: string | null;
  readonly exercise: {
    readonly id: string;
    readonly name: string;
    readonly muscleGroup: MuscleGroup;
  };
}

export interface RoutineSummary {
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

export interface RoutineDetail extends RoutineSummary {
  readonly items: readonly RoutineItem[];
}

export interface RoutineItemInput {
  readonly exerciseId: string;
  readonly sets: number;
  readonly reps: number;
  readonly loadKg: number | null;
  readonly loadNote: string | null;
}

export interface RoutineInput {
  readonly name: string;
  readonly description: string | null;
  readonly focusTag: string | null;
  readonly intensity: RoutineIntensity;
  readonly estimatedMinutes: number;
  readonly scheduledDays: readonly number[];
  readonly items: readonly RoutineItemInput[];
}

export const WEEKDAY_OPTIONS: readonly { readonly value: number; readonly label: string }[] = [
  { value: 1, label: 'Lun' },
  { value: 2, label: 'Mar' },
  { value: 3, label: 'Mié' },
  { value: 4, label: 'Jue' },
  { value: 5, label: 'Vie' },
  { value: 6, label: 'Sáb' },
  { value: 7, label: 'Dom' },
];
