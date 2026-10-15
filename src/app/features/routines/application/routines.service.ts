import { Service, computed, inject, signal } from '@angular/core';
import { Exercise, ExerciseDraft } from '@features/routines/domain/models/exercise';
import { GymLevel } from '@features/routines/domain/models/gym-level';
import { RecommendationPlan } from '@features/routines/domain/models/recommendation';
import {
  RoutineDetail,
  RoutineInput,
  RoutineSummary,
} from '@features/routines/domain/models/routine';
import { RoutinesGateway } from '@features/routines/domain/ports/routines-gateway';
import { HttpRoutinesGateway } from '@features/routines/infrastructure/http-routines-gateway';

const GENERIC_ERROR = 'No se pudo completar la acción. Inténtalo de nuevo.';

@Service()
export class RoutinesService {
  private readonly gateway = inject(RoutinesGateway);

  private readonly routinesState = signal<readonly RoutineSummary[]>([]);
  private readonly exercisesState = signal<readonly Exercise[]>([]);
  private readonly planState = signal<RecommendationPlan | null>(null);
  private readonly levelState = signal<GymLevel | null>(null);
  private readonly loadingState = signal(false);
  private readonly errorState = signal<string | null>(null);
  private readonly busyState = signal(false);
  private readonly noticeState = signal<string | null>(null);

  readonly routines = this.routinesState.asReadonly();
  readonly exercises = this.exercisesState.asReadonly();
  readonly plan = this.planState.asReadonly();
  readonly level = this.levelState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly busy = this.busyState.asReadonly();
  readonly notice = this.noticeState.asReadonly();

  readonly hasRoutines = computed(() => this.routinesState().length > 0);

  async load(): Promise<void> {
    this.loadingState.set(true);
    this.errorState.set(null);

    try {
      const level = await this.gateway.loadLevel();
      this.levelState.set(level);

      const [routines, plan] = await Promise.all([
        this.gateway.listRoutines(),
        level ? this.gateway.loadRecommendations() : Promise.resolve(null),
      ]);
      this.routinesState.set(routines);
      this.planState.set(plan);
    } catch (error) {
      this.errorState.set(
        HttpRoutinesGateway.describeError(error, 'No se pudieron cargar tus rutinas.'),
      );
    } finally {
      this.loadingState.set(false);
    }
  }

  async selectLevel(level: GymLevel): Promise<void> {
    this.busyState.set(true);
    this.errorState.set(null);

    try {
      const saved = await this.gateway.saveLevel(level);
      this.levelState.set(saved);
      this.planState.set(await this.gateway.loadRecommendations());
      this.noticeState.set('Nivel guardado. Este es tu programa recomendado.');
    } catch (error) {
      this.errorState.set(HttpRoutinesGateway.describeError(error, GENERIC_ERROR));
    } finally {
      this.busyState.set(false);
    }
  }

  async getRoutine(id: string): Promise<RoutineDetail | null> {
    this.busyState.set(true);
    this.errorState.set(null);

    try {
      return await this.gateway.getRoutine(id);
    } catch (error) {
      this.errorState.set(HttpRoutinesGateway.describeError(error, 'No se pudo cargar la rutina.'));
      return null;
    } finally {
      this.busyState.set(false);
    }
  }

  async createRoutine(input: RoutineInput): Promise<RoutineDetail | null> {
    this.busyState.set(true);
    this.errorState.set(null);
    this.noticeState.set(null);

    try {
      const created = await this.gateway.createRoutine(input);
      this.routinesState.set([...this.routinesState(), created]);
      this.noticeState.set(`Rutina "${created.name}" creada.`);
      return created;
    } catch (error) {
      this.errorState.set(HttpRoutinesGateway.describeError(error, 'No se pudo crear la rutina.'));
      return null;
    } finally {
      this.busyState.set(false);
    }
  }

  async updateRoutine(id: string, input: RoutineInput): Promise<RoutineDetail | null> {
    this.busyState.set(true);
    this.errorState.set(null);
    this.noticeState.set(null);

    try {
      const updated = await this.gateway.updateRoutine(id, input);
      this.routinesState.update((routines) =>
        routines.map((routine) => (routine.id === updated.id ? updated : routine)),
      );
      this.noticeState.set(`Rutina "${updated.name}" actualizada.`);
      return updated;
    } catch (error) {
      this.errorState.set(
        HttpRoutinesGateway.describeError(error, 'No se pudo actualizar la rutina.'),
      );
      return null;
    } finally {
      this.busyState.set(false);
    }
  }

  async deleteRoutine(id: string): Promise<boolean> {
    this.busyState.set(true);
    this.errorState.set(null);
    this.noticeState.set(null);

    try {
      await this.gateway.deleteRoutine(id);
      this.routinesState.update((routines) => routines.filter((routine) => routine.id !== id));
      this.noticeState.set('Rutina eliminada.');
      return true;
    } catch (error) {
      this.errorState.set(
        HttpRoutinesGateway.describeError(error, 'No se pudo eliminar la rutina.'),
      );
      return false;
    } finally {
      this.busyState.set(false);
    }
  }

  async loadExercises(): Promise<void> {
    if (this.exercisesState().length > 0) {
      return;
    }
    try {
      this.exercisesState.set(await this.gateway.listExercises());
    } catch (error) {
      this.errorState.set(
        HttpRoutinesGateway.describeError(error, 'No se pudieron cargar tus ejercicios.'),
      );
    }
  }

  async createExercise(input: ExerciseDraft): Promise<Exercise | null> {
    this.busyState.set(true);
    this.errorState.set(null);

    try {
      const created = await this.gateway.createExercise(input);
      this.exercisesState.set([...this.exercisesState(), created]);
      return created;
    } catch (error) {
      this.errorState.set(
        HttpRoutinesGateway.describeError(error, 'No se pudo crear el ejercicio.'),
      );
      return null;
    } finally {
      this.busyState.set(false);
    }
  }

  async applyTemplate(templateId: string): Promise<void> {
    this.busyState.set(true);
    this.errorState.set(null);
    this.noticeState.set(null);

    try {
      const created = await this.gateway.applyTemplate(templateId);
      this.routinesState.set([...this.routinesState(), created]);
      this.noticeState.set(`Plantilla "${created.name}" añadida a tus rutinas.`);
    } catch (error) {
      this.errorState.set(
        HttpRoutinesGateway.describeError(error, 'No se pudo añadir la plantilla.'),
      );
    } finally {
      this.busyState.set(false);
    }
  }

  clearNotice(): void {
    this.noticeState.set(null);
  }
}
