import { Service } from '@angular/core';
import {
  HomeView,
  RoutineIntensity,
  WeekDayView,
  WeekStatus,
} from '@features/home/domain/models/home-view';
import { HomeGateway } from '@features/home/domain/ports/home-gateway';

const SIMULATED_LATENCY_MS = 500;
const SCHEDULED_WEEKDAYS = new Set([1, 3, 5]);
const TRAINING_INTENSITY: RoutineIntensity = 'MEDIA';

function toDateOnly(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function startOfWeek(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  const isoDay = result.getDay() === 0 ? 7 : result.getDay();
  result.setDate(result.getDate() - (isoDay - 1));
  return result;
}

function buildWeek(today: Date): WeekDayView[] {
  const weekStart = startOfWeek(today);
  const todayWeekday = today.getDay() === 0 ? 7 : today.getDay();

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);
    const weekday = index + 1;
    const scheduled = SCHEDULED_WEEKDAYS.has(weekday);

    let status: WeekStatus = 'REST';
    if (scheduled && weekday < todayWeekday) {
      status = 'DONE';
    } else if (weekday === todayWeekday) {
      status = 'TODAY';
    } else if (scheduled && weekday > todayWeekday) {
      status = 'PLANNED';
    }

    return { date: toDateOnly(date), weekday, status, minutes: status === 'REST' ? 0 : 45 };
  });
}

@Service()
export class MockHomeGateway extends HomeGateway {
  async loadDashboard(): Promise<HomeView> {
    await new Promise((resolve) => setTimeout(resolve, SIMULATED_LATENCY_MS));

    const week = buildWeek(new Date());
    const done = week.filter((day) => day.status === 'DONE').length;
    const planned = week.filter((day) => day.status !== 'REST').length;
    const lastDone = [...week].reverse().find((day) => day.status === 'DONE');

    return {
      todayWorkout: {
        id: 'mock-routine',
        name: 'Empuje · Pecho y hombro',
        description: 'Sesión de empuje con foco en press banca y press militar.',
        focusTag: 'Empuje',
        intensity: TRAINING_INTENSITY,
        estimatedMinutes: 45,
        scheduledDays: [...SCHEDULED_WEEKDAYS].sort((a, b) => a - b),
        exerciseCount: 6,
        lastDoneAt: lastDone ? `${lastDone.date}T19:30:00.000Z` : null,
      },
      lastWorkout: lastDone
        ? {
            sessionId: 'mock-session',
            routineId: 'mock-routine',
            name: 'Empuje · Pecho y hombro',
            finishedAt: `${lastDone.date}T19:30:00.000Z`,
            durationMinutes: 48,
            volumeKg: 6820,
          }
        : null,
      week,
      weekProgress: { done, planned },
      streakWeeks: 4,
      stats: {
        weekVolumeKg: 18450,
        weekActiveMinutes: done * 45,
        personalRecordsThisMonth: 2,
      },
    };
  }
}
