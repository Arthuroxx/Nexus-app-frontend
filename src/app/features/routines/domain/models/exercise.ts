export type MuscleGroup =
  | 'PECHO'
  | 'ESPALDA'
  | 'HOMBROS'
  | 'BICEPS'
  | 'TRICEPS'
  | 'ANTEBRAZOS'
  | 'PIERNAS'
  | 'GLUTEOS'
  | 'CORE'
  | 'CUERPO_COMPLETO';

export const MUSCLE_GROUPS: readonly MuscleGroup[] = [
  'PECHO',
  'ESPALDA',
  'HOMBROS',
  'BICEPS',
  'TRICEPS',
  'ANTEBRAZOS',
  'PIERNAS',
  'GLUTEOS',
  'CORE',
  'CUERPO_COMPLETO',
];

export interface MuscleGroupOption {
  readonly key: MuscleGroup;
  readonly label: string;
}

export const MUSCLE_GROUP_OPTIONS: readonly MuscleGroupOption[] = [
  { key: 'PECHO', label: 'Pecho' },
  { key: 'ESPALDA', label: 'Espalda' },
  { key: 'HOMBROS', label: 'Hombros' },
  { key: 'BICEPS', label: 'Bíceps' },
  { key: 'TRICEPS', label: 'Tríceps' },
  { key: 'ANTEBRAZOS', label: 'Antebrazos' },
  { key: 'PIERNAS', label: 'Piernas' },
  { key: 'GLUTEOS', label: 'Glúteos' },
  { key: 'CORE', label: 'Core' },
  { key: 'CUERPO_COMPLETO', label: 'Cuerpo completo' },
];

export function muscleGroupLabel(muscleGroup: MuscleGroup): string {
  return MUSCLE_GROUP_OPTIONS.find((option) => option.key === muscleGroup)?.label ?? muscleGroup;
}

export interface Exercise {
  readonly id: string;
  readonly name: string;
  readonly muscleGroup: MuscleGroup;
  readonly defaultSets: number;
  readonly defaultReps: number;
  readonly defaultLoadKg: number | null;
  readonly notes: string | null;
}

export interface ExerciseDraft {
  readonly name: string;
  readonly muscleGroup: MuscleGroup;
  readonly defaultSets: number;
  readonly defaultReps: number;
  readonly defaultLoadKg: number | null;
  readonly notes: string | null;
}
