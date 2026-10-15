import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '@features/auth/application/auth.service';
import { HomeService } from '@features/home/application/home.service';
import { HomeView, RoutineIntensity } from '@features/home/domain/models/home-view';

type MuscleKey = 'pecho' | 'espalda' | 'hombros' | 'biceps' | 'triceps' | 'piernas';
type Metric = 'volumen' | 'series';
type WeeksRange = 4 | 8;

interface MuscleOption {
  readonly key: MuscleKey;
  readonly label: string;
}

interface MuscleWeek {
  readonly label: string;
  readonly volume: number;
  readonly series: number;
}

interface ChartPoint {
  readonly x: number;
  readonly y: number;
}

interface ChartTick {
  readonly value: string;
  readonly y: number;
}

interface ChartLabel {
  readonly text: string;
  readonly x: number;
}

interface ChartGeometry {
  readonly points: readonly ChartPoint[];
  readonly linePath: string;
  readonly areaPath: string;
  readonly ticks: readonly ChartTick[];
  readonly labels: readonly ChartLabel[];
}

const MUSCLES: readonly MuscleOption[] = [
  { key: 'pecho', label: 'Pecho' },
  { key: 'espalda', label: 'Espalda' },
  { key: 'hombros', label: 'Hombros' },
  { key: 'biceps', label: 'Bíceps' },
  { key: 'triceps', label: 'Tríceps' },
  { key: 'piernas', label: 'Piernas' },
];

const WEEKDAY_LETTERS: Record<number, string> = {
  1: 'L',
  2: 'M',
  3: 'X',
  4: 'J',
  5: 'V',
  6: 'S',
  7: 'D',
};

const VIEW_WIDTH = 640;
const VIEW_HEIGHT = 270;
const PLOT_LEFT = 56;
const PLOT_RIGHT = 616;
const PLOT_TOP = 16;
const PLOT_BOTTOM = 236;

const decimalFormat = new Intl.NumberFormat('es-ES', {
  maximumFractionDigits: 1,
});

function formatNumber(value: number): string {
  return new Intl.NumberFormat('es-ES').format(Math.round(value));
}

function formatPercent(value: number): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${decimalFormat.format(value)}%`;
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function niceStep(raw: number): number {
  if (raw <= 0) {
    return 1;
  }

  const power = Math.pow(10, Math.floor(Math.log10(raw)));
  const fraction = raw / power;

  let factor = 10;
  if (fraction <= 1) {
    factor = 1;
  } else if (fraction <= 2) {
    factor = 2;
  } else if (fraction <= 5) {
    factor = 5;
  }

  return factor * power;
}

function niceScale(values: readonly number[]): {
  min: number;
  max: number;
  ticks: readonly number[];
} {
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const spread = rawMax - rawMin;
  const padding = spread > 0 ? spread * 0.3 : Math.max(1, Math.abs(rawMax) * 0.3);

  const low = Math.max(0, rawMin - padding);
  const high = rawMax + padding;

  let step = niceStep((high - low) / 4);
  let min = Math.floor(low / step) * step;
  let max = min + step * 4;

  while (max < high) {
    step = niceStep(step * 2);
    min = Math.floor(low / step) * step;
    max = min + step * 4;
  }

  const ticks = Array.from({ length: 5 }, (_, index) => round(min + step * index));
  return { min, max, ticks };
}

function buildMuscleHistory(home: HomeView | null): Record<MuscleKey, readonly MuscleWeek[]> {
  const history = {} as Record<MuscleKey, readonly MuscleWeek[]>;
  for (const muscle of MUSCLES) {
    history[muscle.key] = [];
  }

  if (!home) {
    return history;
  }

  return history;
}

function relativeDay(iso: string): string {
  const elapsed = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (elapsed <= 0) {
    return 'Hoy';
  }
  if (elapsed === 1) {
    return 'Hace 1 día';
  }
  return `Hace ${elapsed} días`;
}

@Component({
  selector: 'app-home-page',
  imports: [RouterLink],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage {
  private readonly authService = inject(AuthService);
  private readonly homeService = inject(HomeService);

  protected readonly user = this.authService.currentUser;
  protected readonly dashboard = this.homeService.dashboard;
  protected readonly loading = this.homeService.loading;
  protected readonly error = this.homeService.error;

  protected readonly muscles = MUSCLES;
  protected readonly selectedMuscle = signal<MuscleKey>('pecho');
  protected readonly metric = signal<Metric>('volumen');
  protected readonly range = signal<WeeksRange>(4);

  private readonly muscleHistory = computed(() => buildMuscleHistory(this.dashboard()));

  protected readonly selectedLabel = computed(
    () => MUSCLES.find((muscle) => muscle.key === this.selectedMuscle())?.label ?? '',
  );

  protected readonly selectedPoints = computed(() => {
    const history = this.muscleHistory()[this.selectedMuscle()] ?? [];
    const range = this.range();
    return history.slice(Math.max(0, history.length - range));
  });

  protected readonly chart = computed<ChartGeometry | null>(() => {
    const points = this.selectedPoints();
    if (points.length === 0) {
      return null;
    }

    const metric = this.metric();
    const values = points.map((point) => (metric === 'volumen' ? point.volume : point.series));
    const scale = niceScale(values);
    const span = scale.max - scale.min || 1;
    const count = points.length;

    const posX = (index: number) =>
      count > 1
        ? PLOT_LEFT + (index / (count - 1)) * (PLOT_RIGHT - PLOT_LEFT)
        : (PLOT_LEFT + PLOT_RIGHT) / 2;
    const posY = (value: number) =>
      PLOT_BOTTOM - ((value - scale.min) / span) * (PLOT_BOTTOM - PLOT_TOP);

    const coords = values.map((value, index) => ({ x: round(posX(index)), y: round(posY(value)) }));
    const linePath = coords
      .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
      .join(' ');
    const first = coords[0];
    const last = coords[coords.length - 1];
    const areaPath = `${linePath} L ${last.x} ${PLOT_BOTTOM} L ${first.x} ${PLOT_BOTTOM} Z`;

    const ticks = scale.ticks.map((value) => ({
      value: formatNumber(value),
      y: round(posY(value)),
    }));
    const labels = points.map((point, index) => ({
      text: point.label,
      x: round(posX(index)),
    }));

    return { points: coords, linePath, areaPath, ticks, labels };
  });

  protected readonly chartSummary = computed(() => {
    const points = this.selectedPoints();
    const metric = this.metric();
    const unit = metric === 'volumen' ? ' kg' : ' series';
    const values = points.map((point) => (metric === 'volumen' ? point.volume : point.series));

    const current = values.length > 0 ? values[values.length - 1] : 0;
    const previous = values.length > 1 ? values[values.length - 2] : null;
    const best = values.length > 0 ? Math.max(...values) : 0;
    const delta =
      previous !== null && previous > 0 ? ((current - previous) / previous) * 100 : null;

    return {
      current: `${formatNumber(current)}${unit}`,
      delta: delta === null ? '—' : formatPercent(delta),
      best: `${formatNumber(best)}${unit}`,
    };
  });

  protected readonly seriesRows = computed(() => {
    const history = this.muscleHistory();
    return MUSCLES.map((muscle) => {
      const weeks = history[muscle.key] ?? [];
      const series = weeks.length > 0 ? weeks[weeks.length - 1].series : 0;
      return {
        key: muscle.key,
        label: muscle.label,
        series,
        width: Math.min(100, (series / 20) * 100),
      };
    });
  });

  protected readonly weekVolume = computed(() => {
    const home = this.dashboard();
    return `${formatNumber(home?.stats.weekVolumeKg ?? 0)} kg`;
  });

  protected readonly weekMinutes = computed(() => this.dashboard()?.stats.weekActiveMinutes ?? 0);

  protected readonly progressPercent = computed(() => {
    const progress = this.dashboard()?.weekProgress;
    if (!progress || progress.planned <= 0) {
      return 0;
    }
    return (progress.done / progress.planned) * 100;
  });

  protected readonly hasWeekData = computed(
    () => (this.dashboard()?.weekProgress.planned ?? 0) > 0,
  );

  constructor() {
    void this.homeService.load();
  }

  protected reload(): void {
    void this.homeService.load();
  }

  protected selectMuscle(muscle: MuscleKey): void {
    this.selectedMuscle.set(muscle);
  }

  protected selectSeriesMuscle(muscle: MuscleKey): void {
    this.selectedMuscle.set(muscle);
    this.metric.set('series');
  }

  protected setMetric(metric: Metric): void {
    this.metric.set(metric);
  }

  protected setRange(range: WeeksRange): void {
    this.range.set(range);
  }

  protected weekdayLetter(weekday: number): string {
    return WEEKDAY_LETTERS[weekday] ?? '';
  }

  protected intensityLabel(intensity: RoutineIntensity): string {
    if (intensity === 'ALTA') {
      return 'Alta';
    }
    if (intensity === 'BAJA') {
      return 'Baja';
    }
    return 'Media';
  }

  protected relative(iso: string): string {
    return relativeDay(iso);
  }

  protected format(value: number): string {
    return formatNumber(value);
  }
}
