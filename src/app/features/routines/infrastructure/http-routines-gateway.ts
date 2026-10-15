import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '@env/environment';
import { Exercise, ExerciseDraft } from '@features/routines/domain/models/exercise';
import { GymLevel } from '@features/routines/domain/models/gym-level';
import { RecommendationPlan } from '@features/routines/domain/models/recommendation';
import {
  RoutineDetail,
  RoutineInput,
  RoutineSummary,
} from '@features/routines/domain/models/routine';
import { RoutinesGateway } from '@features/routines/domain/ports/routines-gateway';

interface ProblemDetails {
  readonly detail?: string;
}

interface MeResponse {
  readonly experienceLevel: GymLevel | null;
}

interface LevelResponse {
  readonly experienceLevel: GymLevel;
}

@Service()
export class HttpRoutinesGateway extends RoutinesGateway {
  private readonly http = inject(HttpClient);

  private get baseUrl(): string {
    return `${environment.apiUrl}/api`;
  }

  async listRoutines(): Promise<readonly RoutineSummary[]> {
    return firstValueFrom(this.http.get<RoutineSummary[]>(`${this.baseUrl}/routines`));
  }

  async getRoutine(id: string): Promise<RoutineDetail> {
    return firstValueFrom(this.http.get<RoutineDetail>(`${this.baseUrl}/routines/${id}`));
  }

  async createRoutine(input: RoutineInput): Promise<RoutineDetail> {
    return firstValueFrom(this.http.post<RoutineDetail>(`${this.baseUrl}/routines`, input));
  }

  async updateRoutine(id: string, input: RoutineInput): Promise<RoutineDetail> {
    return firstValueFrom(this.http.put<RoutineDetail>(`${this.baseUrl}/routines/${id}`, input));
  }

  async deleteRoutine(id: string): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`${this.baseUrl}/routines/${id}`));
  }

  async listExercises(): Promise<readonly Exercise[]> {
    return firstValueFrom(this.http.get<Exercise[]>(`${this.baseUrl}/exercises`));
  }

  async createExercise(input: ExerciseDraft): Promise<Exercise> {
    return firstValueFrom(this.http.post<Exercise>(`${this.baseUrl}/exercises`, input));
  }

  async loadRecommendations(): Promise<RecommendationPlan> {
    return firstValueFrom(this.http.get<RecommendationPlan>(`${this.baseUrl}/recommendations`));
  }

  async applyTemplate(templateId: string): Promise<RoutineDetail> {
    return firstValueFrom(
      this.http.post<RoutineDetail>(`${this.baseUrl}/recommendations/${templateId}/apply`, {}),
    );
  }

  async loadLevel(): Promise<GymLevel | null> {
    const response = await firstValueFrom(this.http.get<MeResponse>(`${this.baseUrl}/me`));
    return response.experienceLevel ?? null;
  }

  async saveLevel(level: GymLevel): Promise<GymLevel> {
    const response = await firstValueFrom(
      this.http.put<LevelResponse>(`${this.baseUrl}/me/level`, { level }),
    );
    return response.experienceLevel;
  }

  static describeError(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        return 'No se pudo conectar con el servidor. Verifica que el backend esté en línea.';
      }
      const detail = (error.error as ProblemDetails | null)?.detail;
      if (typeof detail === 'string' && detail.trim().length > 0) {
        return detail;
      }
    }
    return fallback;
  }
}
