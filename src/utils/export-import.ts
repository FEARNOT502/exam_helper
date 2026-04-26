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

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_TEXT = 50_000;
const MAX_TAGS = 50;
const MAX_TAG_LEN = 100;

function safeId(v: unknown): string {
  if (typeof v === 'string' && UUID_RE.test(v)) return v;
  return crypto.randomUUID();
}

function safeTags(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((t): t is string => typeof t === 'string' && t.length > 0)
    .slice(0, MAX_TAGS)
    .map((t) => t.slice(0, MAX_TAG_LEN));
}

function safeHistory(v: unknown): Question['history'] {
  if (!Array.isArray(v)) return [];
  return v.filter((item): item is Question['history'][number] => {
    if (!item || typeof item !== 'object') return false;
    const r = item as Record<string, unknown>;
    return typeof r.date === 'number' && typeof r.correct === 'boolean' && typeof r.userAnswer === 'string';
  });
}

function validateExamSet(raw: unknown): ExamSet {
  if (!raw || typeof raw !== 'object') throw new Error('Invalid format');
  const obj = raw as Record<string, unknown>;
  if (typeof obj.title !== 'string') {
    throw new Error('Invalid format');
  }
  const questions = Array.isArray(obj.questions)
    ? (obj.questions as unknown[]).map(validateQuestion)
    : [];
  return {
    id: safeId(obj.id),
    title: (obj.title as string).slice(0, MAX_TEXT),
    subtitle: typeof obj.subtitle === 'string' ? obj.subtitle.slice(0, MAX_TEXT) : undefined,
    tags: safeTags(obj.tags),
    questions,
    createdAt: typeof obj.createdAt === 'number' ? obj.createdAt : Date.now(),
    updatedAt: typeof obj.updatedAt === 'number' ? obj.updatedAt : Date.now(),
  };
}

function validateQuestion(raw: unknown): Question {
  if (!raw || typeof raw !== 'object') throw new Error('Invalid question');
  const obj = raw as Record<string, unknown>;
  return {
    id: safeId(obj.id),
    type: obj.type === 'essay' ? 'essay' : 'blank',
    content: typeof obj.content === 'string' ? obj.content.slice(0, MAX_TEXT) : '',
    answer: typeof obj.answer === 'string' ? obj.answer.slice(0, MAX_TEXT) : undefined,
    tags: safeTags(obj.tags),
    history: safeHistory(obj.history),
    level: ([0, 1, 2, 3].includes(obj.level as number) ? obj.level : 0) as 0 | 1 | 2 | 3,
    nextReviewAt: typeof obj.nextReviewAt === 'number' ? obj.nextReviewAt : 0,
  };
}
