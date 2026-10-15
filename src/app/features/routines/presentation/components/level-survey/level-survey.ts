import { Component, computed, output, signal } from '@angular/core';
import {
  GYM_LEVEL_OPTIONS,
  GymLevel,
  SURVEY_QUESTIONS,
  levelFromScore,
  scoreSurvey,
} from '@features/routines/domain/models/gym-level';

@Component({
  selector: 'app-level-survey',
  templateUrl: './level-survey.html',
  styleUrls: ['../../styles/routines.css', './level-survey.css'],
})
export class LevelSurvey {
  protected readonly questions = SURVEY_QUESTIONS;
  protected readonly levels = GYM_LEVEL_OPTIONS;

  private readonly answers = signal<Record<string, number>>({});

  protected readonly answered = computed(
    () => this.questions.filter((question) => this.answers()[question.id] !== undefined).length,
  );
  protected readonly total = this.questions.length;
  protected readonly complete = computed(() => this.answered() === this.total);
  protected readonly previewLevel = computed(() => {
    const level = levelFromScore(scoreSurvey(this.answers()));
    return this.levels.find((option) => option.key === level);
  });

  readonly completed = output<GymLevel>();

  protected isSelected(questionId: string, weight: number): boolean {
    return this.answers()[questionId] === weight;
  }

  protected answer(questionId: string, weight: number): void {
    this.answers.update((current) => ({ ...current, [questionId]: weight }));
  }

  protected submit(event: Event): void {
    event.preventDefault();
    if (!this.complete()) {
      return;
    }
    this.completed.emit(levelFromScore(scoreSurvey(this.answers())));
  }
}
