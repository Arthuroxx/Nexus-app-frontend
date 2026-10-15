import { MuscleGroup } from '@features/routines/domain/models/exercise';
import { GymLevel } from '@features/routines/domain/models/gym-level';
import { RoutineIntensity } from '@features/routines/domain/models/routine';

export interface RecommendedItem {
  readonly exerciseName: string;
  readonly muscleGroup: MuscleGroup;
  readonly sets: number;
  readonly reps: number;
  readonly repsRange: string;
  readonly loadKg: number | null;
  readonly loadNote: string | null;
}

export interface RecommendedRoutine {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly focusTag: string;
  readonly intensity: RoutineIntensity;
  readonly estimatedMinutes: number;
  readonly scheduledDays: readonly number[];
  readonly items: readonly RecommendedItem[];
}

export interface RecommendationGuideline {
  readonly label: string;
  readonly value: string;
  readonly note: string;
}

export interface RecommendationPlan {
  readonly level: GymLevel;
  readonly levelLabel: string;
  readonly title: string;
  readonly summary: string;
  readonly weeklyFrequency: number;
  readonly guidelines: readonly RecommendationGuideline[];
  readonly routines: readonly RecommendedRoutine[];
}
