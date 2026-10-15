export type GymLevel = 'PRINCIPIANTE' | 'INTERMEDIO' | 'AVANZADO';

export const GYM_LEVELS: readonly GymLevel[] = ['PRINCIPIANTE', 'INTERMEDIO', 'AVANZADO'];

export interface GymLevelOption {
  readonly key: GymLevel;
  readonly label: string;
  readonly description: string;
}

export const GYM_LEVEL_OPTIONS: readonly GymLevelOption[] = [
  {
    key: 'PRINCIPIANTE',
    label: 'Principiante',
    description: 'Menos de 1 año entrenando o empezando ahora.',
  },
  {
    key: 'INTERMEDIO',
    label: 'Intermedio',
    description: 'Entrenas con constancia y conoces los básicos.',
  },
  {
    key: 'AVANZADO',
    label: 'Avanzado',
    description: 'Programas tu entrenamiento y buscas progresar.',
  },
];

export interface SurveyOption {
  readonly id: string;
  readonly label: string;
  readonly weight: number;
}

export interface SurveyQuestion {
  readonly id: string;
  readonly prompt: string;
  readonly options: readonly SurveyOption[];
}

export const SURVEY_QUESTIONS: readonly SurveyQuestion[] = [
  {
    id: 'experience',
    prompt: '¿Cuánto tiempo llevas entrenando en el gimnasio?',
    options: [
      { id: 'less-than-3m', label: 'Menos de 3 meses', weight: 0 },
      { id: '3m-to-1y', label: 'Entre 3 meses y 1 año', weight: 1 },
      { id: 'more-than-1y', label: 'Más de 1 año', weight: 2 },
    ],
  },
  {
    id: 'frequency',
    prompt: '¿Cuántos días por semana entrenas?',
    options: [
      { id: '1-2', label: '1 o 2 días', weight: 0 },
      { id: '3-4', label: '3 o 4 días', weight: 1 },
      { id: '5-plus', label: '5 días o más', weight: 2 },
    ],
  },
  {
    id: 'technique',
    prompt: '¿Cómo describirías tu técnica en los ejercicios básicos?',
    options: [
      { id: 'learning', label: 'Todavía estoy aprendiendo', weight: 0 },
      { id: 'correct', label: 'La ejecuto correctamente', weight: 1 },
      { id: 'advanced', label: 'La domino y progreso cargas', weight: 2 },
    ],
  },
  {
    id: 'planning',
    prompt: '¿Cómo organizas tus entrenamientos?',
    options: [
      { id: 'none', label: 'No tengo una rutina fija', weight: 0 },
      { id: 'follow', label: 'Sigo una rutina hecha', weight: 1 },
      { id: 'design', label: 'Diseño y ajusto la mía', weight: 2 },
    ],
  },
];

export function scoreSurvey(answers: Readonly<Record<string, number>>): number {
  return SURVEY_QUESTIONS.reduce((total, question) => {
    const weight = answers[question.id];
    return total + (typeof weight === 'number' ? weight : 0);
  }, 0);
}

export function levelFromScore(score: number): GymLevel {
  const max = SURVEY_QUESTIONS.length * 2;
  if (score >= max - 2) {
    return 'AVANZADO';
  }
  if (score >= Math.ceil(max / 2) - 1) {
    return 'INTERMEDIO';
  }
  return 'PRINCIPIANTE';
}

export function levelFromAnswers(answers: Readonly<Record<string, number>>): GymLevel {
  return levelFromScore(scoreSurvey(answers));
}
