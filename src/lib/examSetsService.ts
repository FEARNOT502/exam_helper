import { supabase } from './supabase';
import type { ExamSet, Question, AttemptRecord } from '../types';

type Row = Record<string, unknown>;

// ---- Security helpers ----
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_TITLE = 500;
const MAX_CONTENT = 50_000;
const MAX_TAG_LENGTH = 100;
const MAX_TAGS = 50;

function isValidUUID(v: string): boolean {
  return UUID_RE.test(v);
}

/** Get the currently authenticated user's ID from the Supabase session. */
async function getAuthUserId(): Promise<string> {
  if (!supabase) throw new Error('Supabase not configured');
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  return user.id;
}

/** Verify the passed userId matches the authenticated session user. */
async function assertOwner(userId: string): Promise<void> {
  const authId = await getAuthUserId();
  if (userId !== authId) {
    throw new Error('User ID mismatch');
  }
}

function sanitizeText(s: string, maxLen: number): string {
  return s.slice(0, maxLen);
}

function sanitizeTags(tags: string[]): string[] {
  return tags
    .slice(0, MAX_TAGS)
    .map((t) => sanitizeText(t, MAX_TAG_LENGTH))
    .filter((t) => t.length > 0);
}

interface SetRow extends Row {
  id: string;
  user_id: string;
  title: string;
  subtitle: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

interface QuestionRow extends Row {
  id: string;
  set_id: string;
  user_id: string;
  type: 'blank' | 'essay';
  content: string;
  answer: string | null;
  tags: string[];
  level: number;
  next_review_at: number;
  history: AttemptRecord[] | null;
  position: number;
  created_at: string;
  updated_at: string;
}

function toExamSet(setRow: SetRow, qRows: QuestionRow[]): ExamSet {
  const questions: Question[] = qRows
    .filter((q) => q.set_id === setRow.id)
    .sort((a, b) => a.position - b.position)
    .map((q) => ({
      id: q.id,
      type: q.type,
      content: q.content,
      answer: q.answer ?? undefined,
      tags: q.tags ?? [],
      history: q.history ?? [],
      level: (q.level ?? 0) as Question['level'],
      nextReviewAt: q.next_review_at ?? 0,
    }));
  return {
    id: setRow.id,
    title: setRow.title,
    subtitle: setRow.subtitle ?? undefined,
    tags: setRow.tags ?? [],
    questions,
    createdAt: new Date(setRow.created_at).getTime(),
    updatedAt: new Date(setRow.updated_at).getTime(),
  };
}

export async function fetchAllSets(userId: string): Promise<ExamSet[]> {
  if (!supabase) return [];
  await assertOwner(userId);
  const { data: setRows, error: setErr } = await supabase
    .from('exam_sets')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
  if (setErr) throw new Error('Failed to fetch sets');
  if (!setRows || setRows.length === 0) return [];

  const ids = setRows.map((r) => r.id);
  const { data: qRows, error: qErr } = await supabase
    .from('questions')
    .select('*')
    .in('set_id', ids);
  if (qErr) throw new Error('Failed to fetch questions');
  return (setRows as SetRow[]).map((s) => toExamSet(s, (qRows ?? []) as QuestionRow[]));
}

export async function createSet(
  userId: string,
  data: { id: string; title: string; subtitle?: string; tags: string[] }
): Promise<void> {
  if (!supabase) return;
  await assertOwner(userId);
  if (!isValidUUID(data.id)) throw new Error('Invalid set ID format');
  const { error } = await supabase.from('exam_sets').insert({
    id: data.id,
    user_id: userId,
    title: sanitizeText(data.title, MAX_TITLE),
    subtitle: data.subtitle ? sanitizeText(data.subtitle, MAX_TITLE) : null,
    tags: sanitizeTags(data.tags),
  });
  if (error) throw new Error('Failed to create set');
}

export async function updateSet(
  setId: string,
  updates: Partial<Pick<ExamSet, 'title' | 'subtitle' | 'tags'>>
): Promise<void> {
  if (!supabase) return;
  if (!isValidUUID(setId)) throw new Error('Invalid set ID format');
  const payload: Row = {};
  if (updates.title !== undefined) payload.title = sanitizeText(updates.title, MAX_TITLE);
  if (updates.subtitle !== undefined) payload.subtitle = updates.subtitle ? sanitizeText(updates.subtitle, MAX_TITLE) : null;
  if (updates.tags !== undefined) payload.tags = sanitizeTags(updates.tags);
  const { error } = await supabase.from('exam_sets').update(payload).eq('id', setId);
  if (error) throw new Error('Failed to update set');
}

export async function deleteSetRow(setId: string): Promise<void> {
  if (!supabase) return;
  if (!isValidUUID(setId)) throw new Error('Invalid set ID format');
  const { error } = await supabase.from('exam_sets').delete().eq('id', setId);
  if (error) throw new Error('Failed to delete set');
}

export async function insertQuestion(
  userId: string,
  setId: string,
  q: Question,
  position: number
): Promise<void> {
  if (!supabase) return;
  await assertOwner(userId);
  if (!isValidUUID(q.id) || !isValidUUID(setId)) throw new Error('Invalid ID format');
  if (!['blank', 'essay'].includes(q.type)) throw new Error('Invalid question type');
  const { error } = await supabase.from('questions').insert({
    id: q.id,
    set_id: setId,
    user_id: userId,
    type: q.type,
    content: sanitizeText(q.content, MAX_CONTENT),
    answer: q.answer ? sanitizeText(q.answer, MAX_CONTENT) : null,
    tags: sanitizeTags(q.tags),
    level: Math.max(0, Math.min(3, q.level)),
    next_review_at: q.nextReviewAt,
    history: q.history,
    position,
  });
  if (error) throw new Error('Failed to insert question');
}

export async function updateQuestionRow(
  questionId: string,
  updates: Partial<Question>
): Promise<void> {
  if (!supabase) return;
  if (!isValidUUID(questionId)) throw new Error('Invalid question ID format');
  const payload: Row = {};
  if (updates.type !== undefined) {
    if (!['blank', 'essay'].includes(updates.type)) throw new Error('Invalid question type');
    payload.type = updates.type;
  }
  if (updates.content !== undefined) payload.content = sanitizeText(updates.content, MAX_CONTENT);
  if (updates.answer !== undefined) payload.answer = updates.answer ? sanitizeText(updates.answer, MAX_CONTENT) : null;
  if (updates.tags !== undefined) payload.tags = sanitizeTags(updates.tags);
  if (updates.level !== undefined) payload.level = Math.max(0, Math.min(3, updates.level));
  if (updates.nextReviewAt !== undefined) payload.next_review_at = updates.nextReviewAt;
  if (updates.history !== undefined) payload.history = updates.history;
  const { error } = await supabase.from('questions').update(payload).eq('id', questionId);
  if (error) throw new Error('Failed to update question');
}

export async function deleteQuestionRow(questionId: string): Promise<void> {
  if (!supabase) return;
  if (!isValidUUID(questionId)) throw new Error('Invalid question ID format');
  const { error } = await supabase.from('questions').delete().eq('id', questionId);
  if (error) throw new Error('Failed to delete question');
}

export async function reorderQuestionsRows(
  setId: string,
  ordered: { id: string; position: number }[]
): Promise<void> {
  const sb = supabase;
  if (!sb) return;
  if (!isValidUUID(setId)) throw new Error('Invalid set ID format');
  for (const item of ordered) {
    if (!isValidUUID(item.id)) throw new Error('Invalid question ID format');
  }
  await Promise.all(
    ordered.map(({ id, position }) =>
      sb.from('questions').update({ position }).eq('id', id).eq('set_id', setId)
    )
  );
}

export async function recordStudySession(
  userId: string,
  setId: string,
  total: number,
  correct: number,
  durationSec: number,
  mode: string
): Promise<void> {
  if (!supabase) return;
  await assertOwner(userId);
  if (!isValidUUID(setId)) throw new Error('Invalid set ID format');
  const safeTot = Math.max(0, Math.floor(total));
  const safeCor = Math.max(0, Math.min(safeTot, Math.floor(correct)));
  const safeDur = Math.max(0, Math.floor(durationSec));
  const safeMode = sanitizeText(mode, 50);
  const { error } = await supabase.from('study_sessions').insert({
    user_id: userId,
    set_id: setId,
    total: safeTot,
    correct: safeCor,
    duration_sec: safeDur,
    mode: safeMode,
  });
  if (error) throw new Error('Failed to record study session');
}

export interface StudySessionRow {
  id: string;
  user_id: string;
  set_id: string;
  started_at: string;
  duration_sec: number;
  total: number;
  correct: number;
  mode: string;
}

export async function fetchStudySessions(userId: string): Promise<StudySessionRow[]> {
  if (!supabase) return [];
  await assertOwner(userId);
  const { data, error } = await supabase
    .from('study_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('started_at', { ascending: false })
    .limit(1000);
  if (error) throw new Error('Failed to fetch study sessions');
  return (data ?? []) as StudySessionRow[];
}

export async function bulkImportLocalSets(userId: string, sets: ExamSet[]): Promise<void> {
  if (!supabase || sets.length === 0) return;
  await assertOwner(userId);
  const setRows = sets.map((s) => {
    if (!isValidUUID(s.id)) throw new Error('Invalid set ID format in bulk import');
    return {
      id: s.id,
      user_id: userId,
      title: sanitizeText(s.title, MAX_TITLE),
      subtitle: s.subtitle ? sanitizeText(s.subtitle, MAX_TITLE) : null,
      tags: sanitizeTags(s.tags),
    };
  });
  const { error: setErr } = await supabase.from('exam_sets').upsert(setRows, { onConflict: 'id' });
  if (setErr) throw new Error('Failed to bulk import sets');

  const qRows = sets.flatMap((s) =>
    s.questions.map((q, idx) => {
      if (!isValidUUID(q.id)) throw new Error('Invalid question ID format in bulk import');
      if (!['blank', 'essay'].includes(q.type)) throw new Error('Invalid question type in bulk import');
      return {
        id: q.id,
        set_id: s.id,
        user_id: userId,
        type: q.type,
        content: sanitizeText(q.content, MAX_CONTENT),
        answer: q.answer ? sanitizeText(q.answer, MAX_CONTENT) : null,
        tags: sanitizeTags(q.tags),
        level: Math.max(0, Math.min(3, q.level)),
        next_review_at: q.nextReviewAt,
        history: q.history,
        position: idx,
      };
    })
  );
  if (qRows.length > 0) {
    const { error: qErr } = await supabase.from('questions').upsert(qRows, { onConflict: 'id' });
    if (qErr) throw new Error('Failed to bulk import questions');
  }
}
