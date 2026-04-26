import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useExamSetsContext as useExamSets } from '../context/ExamSetsContext';
import {
  loadAllSessions,
  buildDailyMap,
  computeStreak,
  ymd,
  type MergedSession,
} from '../lib/statsService';

export function Statistics() {
  const { user } = useAuth();
  const { sets } = useExamSets();
  const [sessions, setSessions] = useState<MergedSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loadAllSessions(user?.id ?? null).then((rows) => {
      if (!cancelled) {
        setSessions(rows);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const daily = useMemo(() => buildDailyMap(sessions), [sessions]);
  const streak = useMemo(() => computeStreak(daily), [daily]);
  const totalAttempts = sessions.reduce((acc, s) => acc + s.total, 0);
  const totalCorrect = sessions.reduce((acc, s) => acc + s.correct, 0);
  const accuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
  const totalTimeMin = Math.round(sessions.reduce((acc, s) => acc + s.durationSec, 0) / 60);
  const totalQuestionsInLibrary = sets.reduce((acc, s) => acc + s.questions.length, 0);

  // 12 week heatmap: build a 7x12 grid of last 84 days, today at bottom-right
  const heatmap = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days: { date: Date; key: string; intensity: number; count: number }[] = [];
    for (let i = 83; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = ymd(d.getTime());
      const cell = daily.get(key);
      const c = cell?.count ?? 0;
      let intensity = 0;
      if (c >= 1) intensity = 1;
      if (c >= 2) intensity = 2;
      if (c >= 4) intensity = 3;
      if (c >= 7) intensity = 4;
      days.push({ date: d, key, intensity, count: c });
    }
    return days;
  }, [daily]);

  // last 14 days bar chart (accuracy)
  const recentDays = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const out: { label: string; key: string; correct: number; total: number; pct: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = ymd(d.getTime());
      const cell = daily.get(key) ?? { correct: 0, total: 0, count: 0 };
      const pct = cell.total > 0 ? Math.round((cell.correct / cell.total) * 100) : 0;
      out.push({
        label: `${d.getMonth() + 1}/${d.getDate()}`,
        key,
        correct: cell.correct,
        total: cell.total,
        pct,
      });
    }
    return out;
  }, [daily]);

  return (
    <div className="eh-shell">
      <div className="page-container" style={{ maxWidth: 1080, margin: '0 auto', padding: '40px 28px 64px' }}>
        <header style={{ marginBottom: 28 }}>
          <p className="eh-eyebrow" style={{ marginBottom: 10 }}>STATISTICS</p>
          <h1 style={{ fontSize: 30, fontWeight: 600, letterSpacing: '-.025em', margin: 0 }}>학습 통계</h1>
          <p className="eh-muted" style={{ fontSize: 14, marginTop: 8, maxWidth: 560, lineHeight: 1.55 }}>
            지난 12주간의 학습 기록과 누적 성취를 한눈에 확인하세요.
          </p>
        </header>

        {/* KPI grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(140px, 100%), 1fr))',
          gap: 12,
          marginBottom: 24,
        }}>
          <Kpi label="현재 스트릭" value={`${streak.current}일`} hint={`최고 ${streak.best}일`} />
          <Kpi label="총 학습 시간" value={`${totalTimeMin}분`} hint={`${sessions.length}회 세션`} />
          <Kpi label="누적 정답률" value={`${accuracy}%`} hint={`${totalCorrect} / ${totalAttempts}`} />
          <Kpi label="보유 문제 수" value={String(totalQuestionsInLibrary)} hint={`족보 ${sets.length}개`} />
        </div>

        {/* Heatmap */}
        <section className="eh-card" style={{ padding: '22px 24px', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-.01em', margin: 0 }}>학습 캘린더</h2>
            <span className="eh-mono eh-muted-2" style={{ fontSize: 11 }}>지난 12주 · 세션/일</span>
          </div>
          {loading ? (
            <p className="eh-muted" style={{ fontSize: 13 }}>불러오는 중…</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(12, 1fr)',
                gridAutoRows: 14,
                gap: 4,
                gridAutoFlow: 'column',
                gridTemplateRows: 'repeat(7, 14px)',
              }}>
                {heatmap.map((d) => (
                  <div
                    key={d.key}
                    title={`${d.key} · ${d.count}회`}
                    style={{
                      width: '100%',
                      height: 14,
                      borderRadius: 3,
                      background: heatColor(d.intensity),
                      border: d.intensity === 0 ? '1px solid var(--line)' : 'none',
                    }}
                  />
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--ink-4)' }}>
                <span>적음</span>
                {[0, 1, 2, 3, 4].map((i) => (
                  <span key={i} style={{
                    display: 'inline-block', width: 12, height: 12, borderRadius: 3,
                    background: heatColor(i),
                    border: i === 0 ? '1px solid var(--line)' : 'none',
                  }} />
                ))}
                <span>많음</span>
              </div>
            </div>
          )}
        </section>

        {/* Accuracy bars (recent 14 days) */}
        <section className="eh-card" style={{ padding: '22px 24px', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-.01em', margin: 0 }}>최근 14일 정답률</h2>
            <span className="eh-mono eh-muted-2" style={{ fontSize: 11 }}>일별</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 140 }}>
            {recentDays.map((d) => {
              const has = d.total > 0;
              const h = has ? Math.max(4, (d.pct / 100) * 100) : 2;
              return (
                <div key={d.key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{
                    width: '100%', height: 100,
                    display: 'flex', alignItems: 'flex-end',
                  }}>
                    <div title={has ? `${d.pct}% (${d.correct}/${d.total})` : '학습 없음'}
                      style={{
                        width: '100%',
                        height: `${h}%`,
                        background: has ? barColor(d.pct) : 'var(--line)',
                        borderRadius: 4,
                        transition: 'height .25s',
                      }}
                    />
                  </div>
                  <span className="eh-mono" style={{ fontSize: 10, color: 'var(--ink-4)' }}>{d.label}</span>
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: 14, marginTop: 14, fontSize: 11.5, color: 'var(--ink-3)' }}>
            <Legend swatch="var(--ok)" label="80%+" />
            <Legend swatch="var(--warn)" label="40–79%" />
            <Legend swatch="var(--bad)" label="40% 미만" />
          </div>
        </section>

        {/* Recent sessions */}
        <section className="eh-card" style={{ padding: '22px 24px' }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-.01em', margin: 0, marginBottom: 14 }}>
            최근 세션
          </h2>
          {sessions.length === 0 ? (
            <p className="eh-muted" style={{ fontSize: 13 }}>아직 학습 기록이 없습니다. 족보를 학습하면 여기에 기록됩니다.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {sessions.slice(0, 12).map((s, i) => {
                const set = sets.find((x) => x.id === s.setId);
                const pct = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;
                return (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 0',
                    borderTop: i === 0 ? 'none' : '1px solid var(--line)',
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 13.5, fontWeight: 500, color: 'var(--ink)' }} className="truncate">
                        {set?.title ?? '삭제된 족보'}
                      </p>
                      <p className="eh-mono" style={{ fontSize: 11, color: 'var(--ink-4)', margin: 0, marginTop: 2 }}>
                        {new Date(s.startedAt).toLocaleString('ko-KR')} · {s.mode}
                      </p>
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, color: 'var(--ink-3)' }}>
                      {s.correct} / {s.total}
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600,
                      color: barColor(pct), minWidth: 44, textAlign: 'right',
                    }}>
                      {pct}%
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function Kpi({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="eh-card" style={{ padding: '16px 18px' }}>
      <p className="eh-field-label" style={{ marginBottom: 8 }}>{label}</p>
      <p style={{ margin: 0, fontSize: 24, fontWeight: 700, letterSpacing: '-.02em', fontFamily: 'var(--font-mono)' }}>
        {value}
      </p>
      {hint && <p className="eh-muted" style={{ fontSize: 11.5, margin: 0, marginTop: 4 }}>{hint}</p>}
    </div>
  );
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 10, height: 10, borderRadius: 3, background: swatch, display: 'inline-block' }} />
      {label}
    </span>
  );
}

function heatColor(intensity: number): string {
  // Use accent ramp so it follows theme variables
  switch (intensity) {
    case 0: return 'var(--surface-2)';
    case 1: return 'oklch(85% 0.05 268)';
    case 2: return 'oklch(72% 0.10 268)';
    case 3: return 'oklch(60% 0.14 268)';
    case 4: return 'oklch(50% 0.17 268)';
    default: return 'var(--surface-2)';
  }
}

function barColor(pct: number): string {
  if (pct >= 80) return 'var(--ok)';
  if (pct >= 40) return 'var(--warn)';
  return 'var(--bad)';
}
