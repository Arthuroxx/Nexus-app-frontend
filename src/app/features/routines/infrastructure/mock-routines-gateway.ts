import { Service } from '@angular/core';
import { Exercise, ExerciseDraft, MuscleGroup } from '@features/routines/domain/models/exercise';
import { GymLevel } from '@features/routines/domain/models/gym-level';
import {
  RecommendationPlan,
  RecommendedItem,
  RecommendedRoutine,
} from '@features/routines/domain/models/recommendation';
import {
  RoutineDetail,
  RoutineInput,
  RoutineItem,
  RoutineItemInput,
  RoutineSummary,
} from '@features/routines/domain/models/routine';
import { RoutinesGateway } from '@features/routines/domain/ports/routines-gateway';

const SIMULATED_LATENCY_MS = 300;

const LEVEL_LABELS: Record<GymLevel, string> = {
  PRINCIPIANTE: 'Principiante',
  INTERMEDIO: 'Intermedio',
  AVANZADO: 'Avanzado',
};

function item(
  exerciseName: string,
  muscleGroup: MuscleGroup,
  sets: number,
  repsRange: string,
  loadNote: string,
): RecommendedItem {
  return {
    exerciseName,
    muscleGroup,
    sets,
    reps: Number.parseInt(repsRange, 10),
    repsRange,
    loadKg: null,
    loadNote,
  };
}

interface MockBlueprint {
  readonly title: string;
  readonly summary: string;
  readonly weeklyFrequency: number;
  readonly guidelines: RecommendationPlan['guidelines'];
  readonly routines: readonly RecommendedRoutine[];
}

const PLANS: Record<GymLevel, MockBlueprint> = {
  PRINCIPIANTE: {
    title: 'Full-body 3 días/semana',
    summary:
      'Cuerpo completo 3 veces por semana para aprender los básicos y sumar ~10 series efectivas por músculo.',
    weeklyFrequency: 3,
    guidelines: [
      { label: 'Volumen', value: '~9-10 series/músculo', note: 'El mínimo eficaz.' },
      { label: 'Frecuencia', value: '2-3× por músculo', note: 'Lunes, miércoles y viernes.' },
      { label: 'Intensidad', value: 'RIR 2-3', note: '≈65-75% 1RM.' },
      { label: 'Repeticiones', value: '8-12', note: 'Excéntrico controlado.' },
    ],
    routines: [
      {
        id: 'principiante-fullbody-a',
        name: 'Full-body A',
        description: 'Sesión full-body con foco en técnica y básicos.',
        focusTag: 'Full-body',
        intensity: 'BAJA',
        estimatedMinutes: 50,
        scheduledDays: [1],
        items: [
          item('Sentadilla con barra', 'PIERNAS', 3, '8-12', 'RIR 2-3'),
          item('Press de banca', 'PECHO', 3, '8-12', 'RIR 2-3'),
          item('Remo con barra', 'ESPALDA', 3, '8-12', 'RIR 2-3'),
        ],
      },
      {
        id: 'principiante-fullbody-b',
        name: 'Full-body B',
        description: 'Segunda sesión full-body: empuje, tirón y accesorios.',
        focusTag: 'Full-body',
        intensity: 'BAJA',
        estimatedMinutes: 50,
        scheduledDays: [3],
        items: [
          item('Peso muerto rumano', 'PIERNAS', 3, '8-12', 'RIR 2-3'),
          item('Press militar con mancuernas', 'HOMBROS', 3, '8-12', 'RIR 2-3'),
          item('Jalón al pecho', 'ESPALDA', 3, '8-12', 'RIR 2-3'),
        ],
      },
    ],
  },
  INTERMEDIO: {
    title: 'Torso/Pierna 4 días/semana',
    summary:
      'Split torso/pierna para subir el volumen a 12-16 series por músculo con cada zona 2 veces por semana.',
    weeklyFrequency: 4,
    guidelines: [
      { label: 'Volumen', value: '12-16 series/músculo', note: 'Reparte en 2 sesiones por zona.' },
      { label: 'Frecuencia', value: '2× por músculo', note: 'Torso y pierna, 4 días.' },
      { label: 'Intensidad', value: 'RIR 1-2', note: '≈70-80% 1RM.' },
    ],
    routines: [
      {
        id: 'intermedio-torso-a',
        name: 'Torso A',
        description: 'Empuje y tirón horizontal.',
        focusTag: 'Torso',
        intensity: 'MEDIA',
        estimatedMinutes: 65,
        scheduledDays: [1],
        items: [
          item('Press de banca', 'PECHO', 4, '6-10', 'RIR 1-2'),
          item('Remo con barra', 'ESPALDA', 4, '6-10', 'RIR 1-2'),
        ],
      },
      {
        id: 'intermedio-pierna-a',
        name: 'Pierna A',
        description: 'Dominante de rodilla con accesorios.',
        focusTag: 'Pierna',
        intensity: 'MEDIA',
        estimatedMinutes: 60,
        scheduledDays: [2],
        items: [
          item('Sentadilla con barra', 'PIERNAS', 4, '6-10', 'RIR 1-2'),
          item('Curl femoral tumbado', 'PIERNAS', 3, '10-12', 'RIR 1-2'),
        ],
      },
    ],
  },
  AVANZADO: {
    title: 'Push/Pull/Legs 6 días/semana',
    summary:
      'Split push/pull/legs para 16-20+ series por músculo con cada zona 2 veces por semana.',
    weeklyFrequency: 6,
    guidelines: [
      { label: 'Volumen', value: '16-20+ series/músculo', note: 'Más volumen si progresas.' },
      { label: 'Frecuencia', value: '2× por músculo', note: 'PPL repetido dos veces.' },
      { label: 'Intensidad', value: 'RIR 0-2', note: '≈75-85% 1RM.' },
    ],
    routines: [
      {
        id: 'avanzado-empuje',
        name: 'Push',
        description: 'Empuje: pecho, hombro y tríceps.',
        focusTag: 'Empuje',
        intensity: 'ALTA',
        estimatedMinutes: 75,
        scheduledDays: [1, 4],
        items: [
          item('Press de banca', 'PECHO', 4, '5-8', 'RIR 0-2'),
          item('Press militar con barra', 'HOMBROS', 4, '6-10', 'RIR 0-2'),
          item('Extensión de tríceps en polea', 'TRICEPS', 4, '10-12', 'RIR 0-2'),
        ],
      },
      {
        id: 'avanzado-tiron',
        name: 'Pull',
        description: 'Tirón: espalda, bíceps y deltoides posterior.',
        focusTag: 'Tirón',
        intensity: 'ALTA',
        estimatedMinutes: 70,
        scheduledDays: [2, 5],
        items: [
          item('Dominadas', 'ESPALDA', 4, '6-10', 'RIR 0-2'),
          item('Curl con barra', 'BICEPS', 4, '8-12', 'RIR 0-2'),
        ],
      },
      {
        id: 'avanzado-pierna',
        name: 'Legs',
        description: 'Pierna completo con volumen alto.',
        focusTag: 'Pierna',
        intensity: 'ALTA',
        estimatedMinutes: 75,
        scheduledDays: [3, 6],
        items: [
          item('Sentadilla con barra', 'PIERNAS', 4, '5-8', 'RIR 0-2'),
          item('Peso muerto rumano', 'PIERNAS', 4, '6-10', 'RIR 0-2'),
        ],
      },
    ],
  },
};

@Service()
export class MockRoutinesGateway extends RoutinesGateway {
  private readonly exercises: Exercise[] = [];
  private readonly routines: RoutineDetail[] = [];
  private level: GymLevel | null = null;
  private nextRoutineId = 1;
  private nextExerciseId = 1;

  async listRoutines(): Promise<readonly RoutineSummary[]> {
    await this.delay();
    return [...this.routines];
  }

  async getRoutine(id: string): Promise<RoutineDetail> {
    await this.delay();
    const routine = this.routines.find((entry) => entry.id === id);
    if (!routine) {
      throw new Error('La rutina no existe o no es tuya.');
    }
    return routine;
  }

  async createRoutine(input: RoutineInput): Promise<RoutineDetail> {
    await this.delay();
    const id = `mock-${this.nextRoutineId++}`;
    const detail: RoutineDetail = {
      id,
      name: input.name,
      description: input.description,
      focusTag: input.focusTag,
      intensity: input.intensity,
      estimatedMinutes: input.estimatedMinutes,
      scheduledDays: [...input.scheduledDays].sort((a, b) => a - b),
      exerciseCount: input.items.length,
      lastDoneAt: null,
      items: this.buildItems(id, input.items),
    };
    this.routines.push(detail);
    return detail;
  }

  async updateRoutine(id: string, input: RoutineInput): Promise<RoutineDetail> {
    await this.delay();
    const index = this.routines.findIndex((entry) => entry.id === id);
    if (index === -1) {
      throw new Error('La rutina no existe o no es tuya.');
    }
    const updated: RoutineDetail = {
      id,
      name: input.name,
      description: input.description,
      focusTag: input.focusTag,
      intensity: input.intensity,
      estimatedMinutes: input.estimatedMinutes,
      scheduledDays: [...input.scheduledDays].sort((a, b) => a - b),
      exerciseCount: input.items.length,
      lastDoneAt: this.routines[index].lastDoneAt,
      items: this.buildItems(id, input.items),
    };
    this.routines[index] = updated;
    return updated;
  }

  async deleteRoutine(id: string): Promise<void> {
    await this.delay();
    const index = this.routines.findIndex((entry) => entry.id === id);
    if (index === -1) {
      throw new Error('La rutina no existe o no es tuya.');
    }
    this.routines.splice(index, 1);
  }

  async listExercises(): Promise<readonly Exercise[]> {
    await this.delay();
    return [...this.exercises];
  }

  async createExercise(input: ExerciseDraft): Promise<Exercise> {
    await this.delay();
    const exercise: Exercise = {
      id: `mock-exercise-${this.nextExerciseId++}`,
      name: input.name,
      muscleGroup: input.muscleGroup,
      defaultSets: input.defaultSets,
      defaultReps: input.defaultReps,
      defaultLoadKg: input.defaultLoadKg,
      notes: input.notes,
    };
    this.exercises.push(exercise);
    return exercise;
  }

  async loadRecommendations(): Promise<RecommendationPlan> {
    await this.delay();
    return this.plan();
  }

  private plan(): RecommendationPlan {
    const level = this.level ?? 'PRINCIPIANTE';
    const blueprint = PLANS[level];
    return { level, levelLabel: LEVEL_LABELS[level], ...blueprint };
  }

  async applyTemplate(templateId: string): Promise<RoutineDetail> {
    const routine = this.plan().routines.find((entry) => entry.id === templateId);
    if (!routine) {
      throw new Error('La plantilla de rutina no existe.');
    }
    const items: RoutineItemInput[] = routine.items.map((entry) => {
      const exercise = this.ensureExercise(entry);
      return {
        exerciseId: exercise.id,
        sets: entry.sets,
        reps: entry.reps,
        loadKg: entry.loadKg,
        loadNote: entry.loadNote,
      };
    });
    return this.createRoutine({
      name: routine.name,
      description: routine.description,
      focusTag: routine.focusTag,
      intensity: routine.intensity,
      estimatedMinutes: routine.estimatedMinutes,
      scheduledDays: routine.scheduledDays,
      items,
    });
  }

  private ensureExercise(entry: RecommendedItem): Exercise {
    const existing = this.exercises.find(
      (exercise) => exercise.name.toLowerCase() === entry.exerciseName.toLowerCase(),
    );
    if (existing) {
      return existing;
    }
    const exercise: Exercise = {
      id: `mock-exercise-${this.nextExerciseId++}`,
      name: entry.exerciseName,
      muscleGroup: entry.muscleGroup,
      defaultSets: entry.sets,
      defaultReps: entry.reps,
      defaultLoadKg: entry.loadKg,
      notes: null,
    };
    this.exercises.push(exercise);
    return exercise;
  }

  private buildItems(routineId: string, items: readonly RoutineItemInput[]): RoutineItem[] {
    return items.map((item, index) => {
      const exercise = this.exercises.find((entry) => entry.id === item.exerciseId);
      return {
        id: `${routineId}-item-${index + 1}`,
        exerciseId: item.exerciseId,
        position: index + 1,
        sets: item.sets,
        reps: item.reps,
        loadKg: item.loadKg,
        loadNote: item.loadNote,
        exercise: {
          id: item.exerciseId,
          name: exercise?.name ?? 'Ejercicio',
          muscleGroup: exercise?.muscleGroup ?? 'CUERPO_COMPLETO',
        },
      };
    });
  }

  async loadLevel(): Promise<GymLevel | null> {
    await this.delay();
    return this.level;
  }

  async saveLevel(level: GymLevel): Promise<GymLevel> {
    await this.delay();
    this.level = level;
    return level;
  }

  private delay(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, SIMULATED_LATENCY_MS));
  }
}
