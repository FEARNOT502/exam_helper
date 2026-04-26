import { useNavigate } from 'react-router-dom';
import type { Question } from '../../types';
import { Button } from '../common/Button';
import { renderPreview } from '../../utils/blank-parser';

interface ResultSummaryProps {
  setId: string;
  total: number;
  correctCount: number;
  wrongQuestions: Question[];
  onRetryWrong: () => void;
}

export function ResultSummary({
  setId,
  total,
  correctCount,
  wrongQuestions,
  onRetryWrong,
}: ResultSummaryProps) {
  const navigate = useNavigate();
  const pct = total === 0 ? 0 : Math.round((correctCount / total) * 100);

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="eh-card" style={{ padding: '36px 28px', textAlign: 'center' }}>
        <p className="eh-field-label" style={{ marginBottom: 6 }}>학습 결과</p>
        <div style={{ fontSize: 56, fontWeight: 300, letterSpacing: '-.04em', color: 'var(--ink)', lineHeight: 1, marginBottom: 10, fontVariantNumeric: 'tabular-nums' }}>
          {pct}
          <span style={{ fontSize: 24, color: 'var(--ink-3)', fontWeight: 400 }}>%</span>
        </div>
        <p className="eh-muted" style={{ fontSize: 13, margin: 0, marginBottom: 20, fontFamily: 'var(--font-mono)' }}>
          {correctCount} / {total} correct
        </p>
        <div className="eh-bar" style={{ height: 6 }}>
          <span style={{ width: `${pct}%`, background: pct === 100 ? 'var(--ok)' : pct >= 50 ? 'var(--accent)' : 'var(--warn)' }} />
        </div>
      </div>

      {wrongQuestions.length > 0 && (
        <div className="eh-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-.01em', color: 'var(--ink)', margin: 0 }}>
              틀린 문제
            </h3>
            <span className="eh-muted" style={{ fontSize: 12, fontFamily: 'var(--font-mono)' }}>{wrongQuestions.length}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {wrongQuestions.map((q) => (
              <div
                key={q.id}
                style={{
                  padding: 12,
                  background: 'var(--bad-soft)',
                  borderRadius: 10,
                  borderLeft: '2px solid var(--bad)',
                }}
              >
                <p style={{ fontSize: 13, color: 'var(--ink-2)', margin: 0, lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {q.type === 'blank' ? renderPreview(q.content) : q.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {wrongQuestions.length > 0 && (
          <Button className="w-full" onClick={onRetryWrong}>
            틀린 문제만 다시 풀기
          </Button>
        )}
        <Button variant="secondary" className="w-full" onClick={() => navigate(`/set/${setId}`)}>
          족보로 돌아가기
        </Button>
        <Button variant="ghost" className="w-full" onClick={() => navigate('/')}>
          홈으로
        </Button>
      </div>
    </div>
  );
}
