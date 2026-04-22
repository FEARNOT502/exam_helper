import type { Question } from '../types';

const LEVEL_INTERVALS_MS: Record<number, number> = {
  0: 0,
  1: 1 * 24 * 60 * 60 * 1000,
  2: 3 * 24 * 60 * 60 * 1000,
  3: 7 * 24 * 60 * 60 * 1000,
};

export function updateQuestionLevel(
  question: Question,
  correct: boolean,
  selfEval?: 'perfect' | 'partial' | 'wrong'
): Partial<Question> {
  let newLevel: 0 | 1 | 2 | 3 = question.level;

  if (question.type === 'blank') {
    if (correct) {
      newLevel = Math.min(3, question.level + 1) as 0 | 1 | 2 | 3;
    } else {
      newLevel = 0;
    }
  } else {
    if (selfEval === 'perfect') {
      newLevel = Math.min(3, question.level + 1) as 0 | 1 | 2 | 3;
    } else if (selfEval === 'wrong') {
      newLevel = 0;
    }
    // partial: level unchanged
  }

  const nextReviewAt = Date.now() + LEVEL_INTERVALS_MS[newLevel];
  return { level: newLevel, nextReviewAt };
}

export function isDueForReview(question: Question): boolean {
  return question.nextReviewAt <= Date.now();
}

export function getLevelLabel(level: 0 | 1 | 2 | 3): string {
  const labels = ['미학습', '학습중', '거의암기', '암기완료'];
  return labels[level];
}

export function getLevelColor(level: 0 | 1 | 2 | 3): string {
  const colors = [
    'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
    'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  ];
  return colors[level];
}
