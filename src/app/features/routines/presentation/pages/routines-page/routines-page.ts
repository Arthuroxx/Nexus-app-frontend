import { Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { RoutinesService } from '@features/routines/application/routines.service';
import { GYM_LEVEL_OPTIONS, GymLevel } from '@features/routines/domain/models/gym-level';
import {
  RoutineDetail,
  RoutineIntensity,
  WEEKDAY_OPTIONS,
} from '@features/routines/domain/models/routine';
import { CreateRoutineDialog } from '@features/routines/presentation/components/create-routine-dialog/create-routine-dialog';
import { LevelSurvey } from '@features/routines/presentation/components/level-survey/level-survey';

const INTENSITY_LABELS: Record<string, string> = {
  BAJA: 'Baja',
  MEDIA: 'Media',
  ALTA: 'Alta',
};

const FALLBACK_DESCRIPTIONS: Record<string, string> = {
  Push: 'Empuje: pecho, hombro y tríceps. Volumen alto a RIR 0-2.',
  Pull: 'Tirón: espalda, bíceps y deltoides posterior. Mezcla cargas y RIR 0-2.',
  Legs: 'Pierna completo: cuádriceps, femoral, glúteo y gemelo con volumen alto.',
};

interface ParameterBlock {
  label: string;
  value: string;
  note: string;
}

const DEFAULT_PARAMETERS: readonly ParameterBlock[] = [
  {
    label: 'Volumen',
    value: '16-20+ series/músculo',
    note: 'Más volumen solo aporta si sigues progresando.',
  },
  {
    label: 'Frecuencia',
    value: '2× por músculo',
    note: 'Push/Pull/Legs repetido dos veces por semana.',
  },
  {
    label: 'Intensidad',
    value: 'RIR 0-2',
    note: '≈75-85% 1RM en los movimientos compuestos.',
  },
  {
    label: 'Repeticiones',
    value: '5-12 · 12-20',
    note: 'Compuestos pesados 5-12; aislamientos 12-20.',
  },
  {
    label: 'Descanso',
    value: '2-3 min',
    note: 'En los movimientos principales.',
  },
  {
    label: 'Progresión',
    value: 'Doble progresión',
    note: 'Sube repeticiones y luego carga; descarga cada 4-6 semanas.',
  },
];

type RoutineView = 'mine' | 'plan';

interface DetailItem {
  readonly key: string;
  readonly name: string;
  readonly prescription: string;
}

interface RoutineTab {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly intensity: RoutineIntensity;
  readonly days: readonly number[];
  readonly minutes: number;
  readonly itemCount: number;
  readonly isPlan: boolean;
  readonly isAdded: boolean;
  readonly items: readonly DetailItem[];
}

@Component({
  selector: 'app-routines-page',
  imports: [LevelSurvey, CreateRoutineDialog],
  templateUrl: './routines-page.html',
  styleUrls: ['./routines-page.css'],
})
export class RoutinesPage implements OnInit {
  protected readonly routinesService = inject(RoutinesService);

  protected readonly showDialog = signal(false);
  protected readonly editingRoutine = signal<RoutineDetail | null>(null);
  protected readonly pendingDeleteId = signal<string | null>(null);
  protected readonly forceSurvey = signal(false);
  protected readonly dismissedError = signal<string | null>(null);

  protected readonly view = signal<RoutineView>('mine');
  protected readonly selectedId = signal<string | null>(null);
  protected readonly selectedDay = signal<number | null>(null);
  protected readonly checked = signal<ReadonlySet<string>>(new Set());
  protected readonly details = signal<Readonly<Record<string, RoutineDetail>>>({});

  protected readonly weekdays = WEEKDAY_OPTIONS;

  protected readonly routines = this.routinesService.routines;
  protected readonly plan = this.routinesService.plan;
  protected readonly loading = this.routinesService.loading;
  protected readonly error = this.routinesService.error;
  protected readonly notice = this.routinesService.notice;
  protected readonly busy = this.routinesService.busy;
  protected readonly level = this.routinesService.level;

  protected readonly showSurvey = computed(() => this.level() === null || this.forceSurvey());

  protected readonly levelLabel = computed(() => {
    const level = this.level();
    return GYM_LEVEL_OPTIONS.find((option) => option.key === level)?.label ?? null;
  });

  protected readonly myRoutineTabs = computed(() => {
    return this.routines().map((summary) => {
      const detail = this.details()[summary.id];
      const items = (detail?.items ?? []).map((item) => ({
        key: item.id,
        name: item.exercise.name,
        prescription: `${item.sets} × ${item.reps}`,
      }));
      return {
        id: summary.id,
        name: summary.name,
        description: summary.description ?? FALLBACK_DESCRIPTIONS[summary.name] ?? '',
        intensity: summary.intensity,
        days: summary.scheduledDays,
        minutes: summary.estimatedMinutes,
        itemCount: summary.exerciseCount,
        isPlan: false,
        isAdded: true,
        items,
      };
    });
  });

  protected readonly planRoutineTabs = computed(() => {
    const plan = this.plan();
    if (!plan) {
      return [];
    }
    const mineNames = new Set(this.routines().map((routine) => routine.name));
    return plan.routines.map((routine) => ({
      id: routine.id,
      name: routine.name,
      description: routine.description ?? FALLBACK_DESCRIPTIONS[routine.name] ?? '',
      intensity: routine.intensity,
      days: routine.scheduledDays,
      minutes: routine.estimatedMinutes,
      itemCount: routine.items.length,
      isPlan: true,
      isAdded: mineNames.has(routine.name),
      items: routine.items.map((item, index) => ({
        key: `${routine.id}-${index}`,
        name: item.exerciseName,
        prescription: `${item.sets} × ${item.repsRange}`,
      })),
    }));
  });

  protected readonly tabs = computed(() =>
    this.view() === 'mine' ? this.myRoutineTabs() : this.planRoutineTabs(),
  );

  protected readonly selectedTab = computed(() => {
    const tabs = this.tabs();
    return tabs.find((tab) => tab.id === this.selectedId()) ?? tabs[0] ?? null;
  });

  protected readonly weekStrip = computed(() =>
    this.weekdays.map((day) => ({
      value: day.value,
      label: day.label,
      routine: this.tabs().find((tab) => tab.days.includes(day.value)) ?? null,
    })),
  );

  protected readonly doneCount = computed(() => {
    const tab = this.selectedTab();
    if (!tab) {
      return 0;
    }
    const checked = this.checked();
    return tab.items.filter((item) => checked.has(this.itemKey(tab.id, item.key))).length;
  });

  protected readonly progress = computed(() => {
    const tab = this.selectedTab();
    if (!tab || tab.items.length === 0) {
      return 0;
    }
    return Math.round((this.doneCount() / tab.items.length) * 100);
  });

  protected readonly parameters = computed<readonly ParameterBlock[]>(() => {
    const blocks = DEFAULT_PARAMETERS.map((block) => ({ ...block }));
    for (const guideline of this.plan()?.guidelines ?? []) {
      const label = guideline.label.toLowerCase();
      const match = blocks.find((block) => block.label.toLowerCase() === label);
      if (match) {
        match.value = guideline.value;
        match.note = guideline.note;
      } else {
        blocks.push({ label: guideline.label, value: guideline.value, note: guideline.note });
      }
    }
    return blocks;
  });

  protected readonly programSubtitle = computed(() => {
    const plan = this.plan();
    if (!plan) {
      return '';
    }
    const names = [...new Set(plan.routines.map((routine) => routine.name))];
    const singleWords = names.every((name) => !name.includes(' '));
    const split = singleWords
      ? names
      : [...new Set(plan.routines.map((routine) => routine.focusTag).filter(Boolean))];
    return `${split.slice(0, 3).join('/')} · ${plan.weeklyFrequency} días por semana`;
  });

  protected readonly levelLabelValue = computed(() => this.levelLabel() ?? 'Sin definir');

  constructor() {
    effect(() => {
      const tab = this.selectedTab();
      if (tab && !tab.isPlan && !this.details()[tab.id]) {
        void this.loadDetail(tab.id);
      }
    });
  }

  async ngOnInit(): Promise<void> {
    await this.routinesService.load();
    this.setView(this.routines().length === 0 && this.plan() ? 'plan' : 'mine');
  }

  protected setView(view: 'mine' | 'plan'): void {
    this.view.set(view);
    const first = (view === 'mine' ? this.myRoutineTabs() : this.planRoutineTabs())[0];
    this.selectedId.set(first?.id ?? null);
    this.selectedDay.set(first?.days[0] ?? null);
  }

  protected isDaySelected(day: number): boolean {
    return this.selectedDay() === day;
  }

  protected isDayCurrent(day: number): boolean {
    const current = this.selectedTab();
    const stamp = this.weekStrip().find((entry) => entry.value === day);
    return !!current && !!stamp?.routine && stamp.routine.id === current.id;
  }

  protected isChecked(routineId: string, itemKey: string): boolean {
    return this.checked().has(this.itemKey(routineId, itemKey));
  }

  protected toggleItem(routineId: string, itemKey: string): void {
    const key = this.itemKey(routineId, itemKey);
    this.checked.update((set) => {
      const next = new Set(set);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  protected resetChecks(routineId: string): void {
    const prefix = `${routineId}:`;
    this.checked.update((set) => {
      const next = new Set<string>();
      for (const key of set) {
        if (!key.startsWith(prefix)) {
          next.add(key);
        }
      }
      return next;
    });
  }

  protected async onSurveyCompleted(level: GymLevel): Promise<void> {
    this.forceSurvey.set(false);
    await this.routinesService.selectLevel(level);
    this.setView(this.routines().length > 0 ? 'mine' : 'plan');
  }

  protected selectTab(id: string): void {
    const tab = this.tabs().find((entry) => entry.id === id);
    this.selectedId.set(id);
    this.selectedDay.set(tab?.days[0] ?? null);
  }

  protected selectDayFor(day: number): void {
    const routine = this.weekStrip().find((entry) => entry.value === day)?.routine;
    if (routine) {
      this.selectedDay.set(day);
      this.selectedId.set(routine.id);
    }
  }

  protected async addToMine(templateId: string): Promise<void> {
    await this.routinesService.applyTemplate(templateId);
  }

  protected openCreate(): void {
    this.editingRoutine.set(null);
    this.showDialog.set(true);
  }

  protected async editSelected(): Promise<void> {
    const tab = this.selectedTab();
    if (!tab || tab.isPlan) {
      return;
    }
    const detail = this.details()[tab.id] ?? (await this.routinesService.getRoutine(tab.id));
    if (detail) {
      this.details.update((cache) => ({ ...cache, [tab.id]: detail }));
      this.editingRoutine.set(detail);
      this.showDialog.set(true);
    }
  }

  protected closeDialog(): void {
    const edited = this.editingRoutine();
    this.showDialog.set(false);
    this.editingRoutine.set(null);
    if (edited) {
      void this.loadDetail(edited.id);
    }
  }

  protected requestDelete(id: string): void {
    this.pendingDeleteId.set(id);
  }

  protected cancelDelete(): void {
    this.pendingDeleteId.set(null);
  }

  protected isDeleting(id: string): boolean {
    return this.pendingDeleteId() === id;
  }

  protected async confirmDelete(id: string): Promise<void> {
    const deleted = await this.routinesService.deleteRoutine(id);
    if (deleted) {
      this.pendingDeleteId.set(null);
      this.details.update((cache) => {
        const next: Record<string, RoutineDetail> = {};
        for (const [key, value] of Object.entries(cache)) {
          if (key !== id) {
            next[key] = value;
          }
        }
        return next;
      });
    }
  }

  protected retry(): void {
    this.dismissedError.set(null);
    void this.routinesService.load();
  }

  protected dismissError(message: string): void {
    this.dismissedError.set(message);
  }

  protected formatDays(days: readonly number[]): string {
    if (days.length === 0) {
      return 'Sin días';
    }
    return days
      .map((day) => WEEKDAY_OPTIONS.find((option) => option.value === day)?.label ?? '')
      .filter((label) => label.length > 0)
      .join(' · ');
  }

  protected intensityLabel(intensity: string): string {
    return INTENSITY_LABELS[intensity] ?? intensity;
  }

  protected isTabSelected(id: string): boolean {
    return this.selectedTab()?.id === id;
  }

  private itemKey(routineId: string, itemKey: string): string {
    return `${routineId}:${itemKey}`;
  }

  private async loadDetail(id: string): Promise<void> {
    const detail = await this.routinesService.getRoutine(id);
    if (detail) {
      this.details.update((cache) => ({ ...cache, [id]: detail }));
    }
  }
}
