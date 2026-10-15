import { Component, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { MUSCLE_GROUP_OPTIONS, MuscleGroup } from '@features/routines/domain/models/exercise';
import {
  ROUTINE_INTENSITIES,
  RoutineDetail,
  RoutineInput,
  RoutineIntensity,
  WEEKDAY_OPTIONS,
} from '@features/routines/domain/models/routine';
import { RoutinesService } from '@features/routines/application/routines.service';

interface DraftItem {
  key: number;
  exerciseId: string;
  sets: number;
  reps: number;
  loadKg: number | null;
  loadNote: string | null;
}

@Component({
  selector: 'app-create-routine-dialog',
  templateUrl: './create-routine-dialog.html',
  styleUrls: ['../../styles/routines.css', './create-routine-dialog.css'],
})
export class CreateRoutineDialog implements OnInit {
  private readonly routinesService = inject(RoutinesService);

  readonly routine = input<RoutineDetail | null>(null);

  protected readonly intensities = ROUTINE_INTENSITIES;
  protected readonly weekdays = WEEKDAY_OPTIONS;
  protected readonly muscleGroups = MUSCLE_GROUP_OPTIONS;
  protected readonly exercises = this.routinesService.exercises;
  protected readonly busy = this.routinesService.busy;

  readonly closed = output<void>();

  protected readonly isEditing = computed(() => this.routine() !== null);

  protected readonly name = signal('');
  protected readonly focusTag = signal('');
  protected readonly description = signal('');
  protected readonly intensity = signal<RoutineIntensity>('MEDIA');
  protected readonly estimatedMinutes = signal(45);
  protected readonly scheduledDays = signal<readonly number[]>([]);
  protected readonly items = signal<readonly DraftItem[]>([]);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly showExerciseForm = signal(false);
  protected readonly newExerciseName = signal('');
  protected readonly newExerciseMuscle = signal<MuscleGroup>('PECHO');

  private nextKey = 1;

  protected readonly canSubmit = computed(
    () => this.name().trim().length > 0 && this.items().length > 0 && !this.busy(),
  );

  constructor() {
    void this.routinesService.loadExercises();
  }

  ngOnInit(): void {
    const routine = this.routine();
    if (!routine) {
      return;
    }
    this.name.set(routine.name);
    this.focusTag.set(routine.focusTag ?? '');
    this.description.set(routine.description ?? '');
    this.intensity.set(routine.intensity);
    this.estimatedMinutes.set(routine.estimatedMinutes);
    this.scheduledDays.set([...routine.scheduledDays]);
    this.items.set(
      routine.items.map((item) => ({
        key: this.nextKey++,
        exerciseId: item.exerciseId,
        sets: item.sets,
        reps: item.reps,
        loadKg: item.loadKg,
        loadNote: item.loadNote,
      })),
    );
  }

  protected toggleDay(day: number): void {
    this.scheduledDays.update((days) =>
      days.includes(day) ? days.filter((value) => value !== day) : [...days, day].sort(),
    );
  }

  protected isDaySelected(day: number): boolean {
    return this.scheduledDays().includes(day);
  }

  protected addItem(): void {
    this.items.update((items) => [
      ...items,
      { key: this.nextKey++, exerciseId: '', sets: 3, reps: 10, loadKg: null, loadNote: null },
    ]);
  }

  protected removeItem(key: number): void {
    this.items.update((items) => items.filter((item) => item.key !== key));
  }

  protected updateItem(key: number, patch: Partial<Omit<DraftItem, 'key'>>): void {
    this.items.update((items) =>
      items.map((item) => (item.key === key ? { ...item, ...patch } : item)),
    );
  }

  protected onExerciseChange(key: number, exerciseId: string): void {
    const exercise = this.exercises().find((item) => item.id === exerciseId);
    this.updateItem(key, {
      exerciseId,
      sets: exercise?.defaultSets ?? 3,
      reps: exercise?.defaultReps ?? 10,
      loadKg: exercise?.defaultLoadKg ?? null,
      loadNote: null,
    });
  }

  protected onItemNumber(key: number, field: 'sets' | 'reps' | 'loadKg', event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    if (field === 'loadKg') {
      this.updateItem(key, { loadKg: raw === '' ? null : Number(raw) });
      return;
    }
    this.updateItem(key, { [field]: raw === '' ? 0 : Number(raw) });
  }

  protected onInput(target: 'name' | 'focusTag' | 'description', event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    if (target === 'name') {
      this.name.set(value);
    } else if (target === 'focusTag') {
      this.focusTag.set(value);
    } else {
      this.description.set(value);
    }
  }

  protected onMinutes(event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    this.estimatedMinutes.set(raw === '' ? 0 : Number(raw));
  }

  protected onIntensity(event: Event): void {
    this.intensity.set((event.target as HTMLSelectElement).value as RoutineIntensity);
  }

  protected onMuscle(event: Event): void {
    this.newExerciseMuscle.set((event.target as HTMLSelectElement).value as MuscleGroup);
  }

  protected onNewExerciseName(event: Event): void {
    this.newExerciseName.set((event.target as HTMLInputElement).value);
  }

  protected async createExerciseInline(event: Event): Promise<void> {
    event.preventDefault();
    const name = this.newExerciseName().trim();
    if (name.length === 0) {
      return;
    }

    const created = await this.routinesService.createExercise({
      name,
      muscleGroup: this.newExerciseMuscle(),
      defaultSets: 3,
      defaultReps: 10,
      defaultLoadKg: null,
      notes: null,
    });

    if (created) {
      this.items.update((items) => [
        ...items,
        {
          key: this.nextKey++,
          exerciseId: created.id,
          sets: created.defaultSets,
          reps: created.defaultReps,
          loadKg: created.defaultLoadKg,
          loadNote: null,
        },
      ]);
      this.newExerciseName.set('');
      this.showExerciseForm.set(false);
    }
  }

  protected async submit(event: Event): Promise<void> {
    event.preventDefault();
    this.errorMessage.set(null);

    if (this.name().trim().length === 0) {
      this.errorMessage.set('Ponle un nombre a tu rutina.');
      return;
    }
    const items = this.items();
    if (items.length === 0) {
      this.errorMessage.set('Añade al menos un ejercicio.');
      return;
    }
    if (items.some((item) => item.exerciseId.length === 0)) {
      this.errorMessage.set('Selecciona un ejercicio en cada fila.');
      return;
    }

    const input: RoutineInput = {
      name: this.name().trim(),
      description: this.description().trim() || null,
      focusTag: this.focusTag().trim() || null,
      intensity: this.intensity(),
      estimatedMinutes: this.estimatedMinutes(),
      scheduledDays: [...this.scheduledDays()],
      items: items.map((item) => ({
        exerciseId: item.exerciseId,
        sets: item.sets,
        reps: item.reps,
        loadKg: item.loadKg,
        loadNote: item.loadNote,
      })),
    };

    const routine = this.routine();
    const saved = routine
      ? await this.routinesService.updateRoutine(routine.id, input)
      : await this.routinesService.createRoutine(input);
    if (saved) {
      this.closed.emit();
    }
  }

  protected close(): void {
    this.closed.emit();
  }

  protected readonly durationError = computed(() => {
    const minutes = this.estimatedMinutes();
    return minutes < 5 || minutes > 240 ? 'Entre 5 y 240 minutos.' : null;
  });
}
