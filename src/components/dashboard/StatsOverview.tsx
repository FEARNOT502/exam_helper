import type { ExamSet } from '../../types';
import { isDueForReview } from '../../utils/spaced-repetition';

interface StatsOverviewProps {
  sets: ExamSet[];
}

function Stat({ value, label, tone = 'neutral' }: { value: string | number; label: string; tone?: 'neutral' | 'ok' | 'warn' }) {
  const color = tone === 'ok' ? 'var(--ok)' : tone === 'warn' ? 'var(--warn)' : 'var(--ink)';
  return (
    <div className="eh-card-flat" style={{ padding: '20px 22px' }}>
      <p className="eh-eyebrow" style={{ margin: 0, marginBottom: 12 }}>{label}</p>
      <div style={{
        fontSize: 32,
        fontWeight: 400,
        letterSpacing: '-.03em',
        lineHeight: 1,
        color,
        fontVariantNumeric: 'tabular-nums',
        fontFamily: 'var(--font-mono)',
      }}>
        {value}
      </div>
    </div>
  );
}

export function StatsOverview({ sets }: StatsOverviewProps) {
  const allQuestions = sets.flatMap((s) => s.questions);
  const total = allQuestions.length;
  const memorized = allQuestions.filter((q) => q.level === 3).length;
  const dueToday = allQuestions.filter(isDueForReview).length;
  const pct = total === 0 ? 0 : Math.round((memorized / total) * 100);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
      <Stat value={total} label="전체 문제" />
      <Stat value={`${pct}%`} label="암기 완료" tone="ok" />
      <Stat value={dueToday} label="오늘 복습" tone={dueToday > 0 ? 'warn' : 'neutral'} />
    </div>
  );
}
