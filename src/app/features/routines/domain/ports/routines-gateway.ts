import { Exercise, ExerciseDraft } from '@features/routines/domain/models/exercise';
import { GymLevel } from '@features/routines/domain/models/gym-level';
import { RecommendationPlan } from '@features/routines/domain/models/recommendation';
import {
  RoutineDetail,
  RoutineInput,
  RoutineSummary,
} from '@features/routines/domain/models/routine';

export abstract class RoutinesGateway {
  abstract listRoutines(): Promise<readonly RoutineSummary[]>;

  abstract getRoutine(id: string): Promise<RoutineDetail>;

  abstract createRoutine(input: RoutineInput): Promise<RoutineDetail>;

  abstract updateRoutine(id: string, input: RoutineInput): Promise<RoutineDetail>;

  abstract deleteRoutine(id: string): Promise<void>;

  abstract listExercises(): Promise<readonly Exercise[]>;

  abstract createExercise(input: ExerciseDraft): Promise<Exercise>;

  abstract loadRecommendations(): Promise<RecommendationPlan>;

  abstract applyTemplate(templateId: string): Promise<RoutineDetail>;

  abstract loadLevel(): Promise<GymLevel | null>;

  abstract saveLevel(level: GymLevel): Promise<GymLevel>;
}
