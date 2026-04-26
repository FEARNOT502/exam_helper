import { supabase } from './supabase';
import type { ExamSet, Question, AttemptRecord } from '../types';

type Row = Record<string, unknown>;

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
  const { data: setRows, error: setErr } = await supabase
    .from('exam_sets')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
  if (setErr) throw setErr;
  if (!setRows || setRows.length === 0) return [];

  const ids = setRows.map((r) => r.id);
  const { data: qRows, error: qErr } = await supabase
    .from('questions')
    .select('*')
    .in('set_id', ids);
  if (qErr) throw qErr;
  return (setRows as SetRow[]).map((s) => toExamSet(s, (qRows ?? []) as QuestionRow[]));
}

export async function createSet(
  userId: string,
  data: { id: string; title: string; subtitle?: string; tags: string[] }
): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('exam_sets').insert({
    id: data.id,
    user_id: userId,
    title: data.title,
    subtitle: data.subtitle ?? null,
    tags: data.tags,
  });
  if (error) throw error;
}

export async function updateSet(
  setId: string,
  updates: Partial<Pick<ExamSet, 'title' | 'subtitle' | 'tags'>>
): Promise<void> {
  if (!supabase) return;
  const payload: Row = {};
  if (updates.title !== undefined) payload.title = updates.title;
  if (updates.subtitle !== undefined) payload.subtitle = updates.subtitle ?? null;
  if (updates.tags !== undefined) payload.tags = updates.tags;
  const { error } = await supabase.from('exam_sets').update(payload).eq('id', setId);
  if (error) throw error;
}

export async function deleteSetRow(setId: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('exam_sets').delete().eq('id', setId);
  if (error) throw error;
}

export async function insertQuestion(
  userId: string,
  setId: string,
  q: Question,
  position: number
): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('questions').insert({
    id: q.id,
    set_id: setId,
    user_id: userId,
    type: q.type,
    content: q.content,
    answer: q.answer ?? null,
    tags: q.tags,
    level: q.level,
    next_review_at: q.nextReviewAt,
    history: q.history,
    position,
  });
  if (error) throw error;
}

export async function updateQuestionRow(
  questionId: string,
  updates: Partial<Question>
): Promise<void> {
  if (!supabase) return;
  const payload: Row = {};
  if (updates.type !== undefined) payload.type = updates.type;
  if (updates.content !== undefined) payload.content = updates.content;
  if (updates.answer !== undefined) payload.answer = updates.answer ?? null;
  if (updates.tags !== undefined) payload.tags = updates.tags;
  if (updates.level !== undefined) payload.level = updates.level;
  if (updates.nextReviewAt !== undefined) payload.next_review_at = updates.nextReviewAt;
  if (updates.history !== undefined) payload.history = updates.history;
  const { error } = await supabase.from('questions').update(payload).eq('id', questionId);
  if (error) throw error;
}

export async function deleteQuestionRow(questionId: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('questions').delete().eq('id', questionId);
  if (error) throw error;
}

export async function reorderQuestionsRows(
  setId: string,
  ordered: { id: string; position: number }[]
): Promise<void> {
  const sb = supabase;
  if (!sb) return;
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
  const { error } = await supabase.from('study_sessions').insert({
    user_id: userId,
    set_id: setId,
    total,
    correct,
    duration_sec: durationSec,
    mode,
  });
  if (error) throw error;
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
  const { data, error } = await supabase
    .from('study_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('started_at', { ascending: false })
    .limit(1000);
  if (error) throw error;
  return (data ?? []) as StudySessionRow[];
}

export async function bulkImportLocalSets(userId: string, sets: ExamSet[]): Promise<void> {
  if (!supabase || sets.length === 0) return;
  const setRows = sets.map((s) => ({
    id: s.id,
    user_id: userId,
    title: s.title,
    subtitle: s.subtitle ?? null,
    tags: s.tags,
  }));
  const { error: setErr } = await supabase.from('exam_sets').upsert(setRows, { onConflict: 'id' });
  if (setErr) throw setErr;

  const qRows = sets.flatMap((s) =>
    s.questions.map((q, idx) => ({
      id: q.id,
      set_id: s.id,
      user_id: userId,
      type: q.type,
      content: q.content,
      answer: q.answer ?? null,
      tags: q.tags,
      level: q.level,
      next_review_at: q.nextReviewAt,
      history: q.history,
      position: idx,
    }))
  );
  if (qRows.length > 0) {
    const { error: qErr } = await supabase.from('questions').upsert(qRows, { onConflict: 'id' });
    if (qErr) throw qErr;
  }
}
