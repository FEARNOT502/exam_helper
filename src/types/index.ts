export interface AttemptRecord {
  date: number;
  correct: boolean;
  userAnswer: string;
}

export interface Question {
  id: string;
  type: 'blank' | 'essay';
  content: string;
  answer?: string;
  tags: string[];
  history: AttemptRecord[];
  level: 0 | 1 | 2 | 3;
  nextReviewAt: number;
}

export interface ExamSet {
  id: string;
  title: string;
  subtitle?: string;
  tags: string[];
  questions: Question[];
  createdAt: number;
  updatedAt: number;
}

export type StudyFilter = 'all' | 'wrong' | 'unlearned' | 'shuffle';

export interface StudySession {
  questions: Question[];
  currentIndex: number;
  results: { questionId: string; correct: boolean; userAnswer: string }[];
}
