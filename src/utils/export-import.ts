import type { ExamSet, Question } from '../types';

export function exportExamSet(set: ExamSet, includeHistory: boolean): void {
  const data = includeHistory ? set : stripHistory(set);
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${set.title.replace(/\s+/g, '_')}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function stripHistory(set: ExamSet): ExamSet {
  return {
    ...set,
    questions: set.questions.map((q) => ({
      ...q,
      history: [],
      level: 0,
      nextReviewAt: 0,
    })),
  };
}

export async function importExamSet(file: File): Promise<ExamSet> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const raw = JSON.parse(e.target?.result as string) as ExamSet;
        const validated = validateExamSet(raw);
        resolve(validated);
      } catch {
        reject(new Error('유효하지 않은 JSON 파일입니다.'));
      }
    };
    reader.onerror = () => reject(new Error('파일을 읽을 수 없습니다.'));
    reader.readAsText(file);
  });
}

function validateExamSet(raw: unknown): ExamSet {
  if (!raw || typeof raw !== 'object') throw new Error('Invalid format');
  const obj = raw as Record<string, unknown>;
  if (typeof obj.id !== 'string' || typeof obj.title !== 'string') {
    throw new Error('Invalid format');
  }
  const questions = Array.isArray(obj.questions)
    ? (obj.questions as unknown[]).map(validateQuestion)
    : [];
  return {
    id: obj.id as string,
    title: obj.title as string,
    subtitle: typeof obj.subtitle === 'string' ? obj.subtitle : undefined,
    tags: Array.isArray(obj.tags) ? (obj.tags as string[]) : [],
    questions,
    createdAt: typeof obj.createdAt === 'number' ? obj.createdAt : Date.now(),
    updatedAt: typeof obj.updatedAt === 'number' ? obj.updatedAt : Date.now(),
  };
}

function validateQuestion(raw: unknown): Question {
  if (!raw || typeof raw !== 'object') throw new Error('Invalid question');
  const obj = raw as Record<string, unknown>;
  return {
    id: typeof obj.id === 'string' ? obj.id : crypto.randomUUID(),
    type: obj.type === 'essay' ? 'essay' : 'blank',
    content: typeof obj.content === 'string' ? obj.content : '',
    answer: typeof obj.answer === 'string' ? obj.answer : undefined,
    tags: Array.isArray(obj.tags) ? (obj.tags as string[]) : [],
    history: Array.isArray(obj.history) ? (obj.history as Question['history']) : [],
    level: ([0, 1, 2, 3].includes(obj.level as number) ? obj.level : 0) as 0 | 1 | 2 | 3,
    nextReviewAt: typeof obj.nextReviewAt === 'number' ? obj.nextReviewAt : 0,
  };
}
