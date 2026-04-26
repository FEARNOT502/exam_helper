import { supabase } from './supabase';
import { fetchStudySessions, recordStudySession, type StudySessionRow } from './examSetsService';

const LOCAL_KEY = 'exam-master-sessions';

export interface LocalSession {
  id: string;
  setId: string;
  startedAt: number; // ms epoch
  durationSec: number;
  total: number;
  correct: number;
  mode: string;
}

function readLocal(): LocalSession[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) ?? '[]') as LocalSession[];
  } catch {
    return [];
  }
}

function writeLocal(rows: LocalSession[]) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(rows));
  } catch {
    /* quota */
  }
}

/** Append a session locally, then attempt to push to cloud (best-effort). */
export async function logStudySession(opts: {
  userId: string | null;
  setId: string;
  total: number;
  correct: number;
  durationSec: number;
  mode?: string;
}): Promise<void> {
  const row: LocalSession = {
    id: crypto.randomUUID(),
    setId: opts.setId,
    startedAt: Date.now() - opts.durationSec * 1000,
    durationSec: opts.durationSec,
    total: opts.total,
    correct: opts.correct,
    mode: opts.mode ?? 'study',
  };
  writeLocal([row, ...readLocal()].slice(0, 5000));

  if (supabase && opts.userId) {
    try {
      await recordStudySession(
        opts.userId,
        opts.setId,
        opts.total,
        opts.correct,
        opts.durationSec,
        row.mode
      );
    } catch (e) {
      console.warn('[stats] cloud record failed (kept locally)', e);
    }
  }
}

export interface MergedSession {
  startedAt: number;
  setId: string;
  total: number;
  correct: number;
  durationSec: number;
  mode: string;
}

/** Returns sessions merged from cloud (when available) + local cache. */
export async function loadAllSessions(userId: string | null): Promise<MergedSession[]> {
  const local = readLocal();
  let cloud: StudySessionRow[] = [];
  if (supabase && userId) {
    try {
      cloud = await fetchStudySessions(userId);
    } catch (e) {
      console.warn('[stats] cloud fetch failed, using local only', e);
    }
  }
  const cloudMerged: MergedSession[] = cloud.map((c) => ({
    startedAt: new Date(c.started_at).getTime(),
    setId: c.set_id,
    total: c.total,
    correct: c.correct,
    durationSec: c.duration_sec,
    mode: c.mode,
  }));
  const localMerged: MergedSession[] = local.map((l) => ({
    startedAt: l.startedAt,
    setId: l.setId,
    total: l.total,
    correct: l.correct,
    durationSec: l.durationSec,
    mode: l.mode,
  }));
  // simple merge: prefer cloud (authoritative when present), append unique local rows
  const map = new Map<string, MergedSession>();
  [...cloudMerged, ...localMerged].forEach((m) => {
    const k = `${m.setId}-${m.startedAt}-${m.total}-${m.correct}`;
    if (!map.has(k)) map.set(k, m);
  });
  return Array.from(map.values()).sort((a, b) => b.startedAt - a.startedAt);
}

// ---------- Aggregations ----------
export function ymd(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function buildDailyMap(sessions: MergedSession[]): Map<string, { count: number; correct: number; total: number }> {
  const map = new Map<string, { count: number; correct: number; total: number }>();
  for (const s of sessions) {
    const key = ymd(s.startedAt);
    const prev = map.get(key) ?? { count: 0, correct: 0, total: 0 };
    map.set(key, {
      count: prev.count + 1,
      correct: prev.correct + s.correct,
      total: prev.total + s.total,
    });
  }
  return map;
}

export function computeStreak(daily: Map<string, unknown>): { current: number; best: number } {
  // Walk backwards from today
  let current = 0;
  const today = new Date();
  // current streak
  const cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  while (true) {
    const k = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`;
    if (daily.has(k)) {
      current++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  // best streak: scan all keys
  const keys = Array.from(daily.keys()).sort();
  let best = 0;
  let run = 0;
  let prev: Date | null = null;
  for (const k of keys) {
    const [y, m, d] = k.split('-').map(Number);
    const cur = new Date(y, m - 1, d);
    if (prev && (cur.getTime() - prev.getTime()) === 86400000) {
      run++;
    } else {
      run = 1;
    }
    if (run > best) best = run;
    prev = cur;
  }
  return { current, best: Math.max(best, current) };
}
