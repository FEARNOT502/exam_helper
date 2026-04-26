import { useParams, useNavigate } from 'react-router-dom';
import { useExamSetsContext as useExamSets } from '../context/ExamSetsContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { getLevelLabel } from '../utils/spaced-repetition';
import { renderPreview } from '../utils/blank-parser';

export function WrongNotes() {
  const { id: setId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getSet } = useExamSets();

  const set = getSet(setId!);
  if (!set) return null;

  const wrongQuestions = set.questions.filter(
    (q) => q.history.length > 0 && q.history[q.history.length - 1] && !q.history[q.history.length - 1].correct
  );

  return (
    <div className="eh-shell">
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px 64px' }}>
        <button
          onClick={() => navigate(`/set/${setId}`)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'none', border: 'none', color: 'var(--ink-3)',
            fontSize: 12.5, cursor: 'pointer', padding: 0, marginBottom: 16,
            fontFamily: 'inherit',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3L5 8l5 5"/></svg>
          {set.title}
        </button>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20, marginBottom: 28, flexWrap: 'wrap' }}>
          <div>
            <p className="eh-eyebrow" style={{ marginBottom: 8 }}>WRONG NOTES</p>
            <h1 style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-.025em', color: 'var(--ink)', margin: 0, lineHeight: 1.2 }}>
              오답 노트
            </h1>
            <p className="eh-muted" style={{ fontSize: 13.5, margin: 0, marginTop: 6 }}>
              마지막 시도에서 틀린 문제만 모아봅니다.
            </p>
          </div>
          {wrongQuestions.length > 0 && (
            <Button onClick={() => navigate(`/set/${setId}/study?filter=wrong`)}>
              재학습 시작
              <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M4 3l8 5-8 5z"/></svg>
            </Button>
          )}
        </div>

        {wrongQuestions.length === 0 ? (
          <EmptyState
            title="오답 문제가 없습니다"
            description="모든 문제를 정답 처리했거나 아직 시도한 문제가 없습니다."
            actionLabel="학습하러 가기"
            onAction={() => navigate(`/set/${setId}/study?filter=all`)}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p className="eh-mono eh-muted-2" style={{ fontSize: 12, margin: 0 }}>
              {wrongQuestions.length} wrong
            </p>

            {wrongQuestions.map((q) => {
              const lastAttempt = q.history[q.history.length - 1];
              const correctAnswers =
                q.type === 'blank'
                  ? q.content.match(/\{\{([^}]+)\}\}/g)?.map((m) => m.slice(2, -2)).join(', ')
                  : q.answer;

              return (
                <div key={q.id} className="eh-card" style={{ padding: 20 }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                    <Badge className={q.type === 'blank' ? 'eh-chip-blank' : 'eh-chip-essay'}>
                      {q.type === 'blank' ? '단답형' : '서술형'}
                    </Badge>
                    <Badge>{getLevelLabel(q.level)}</Badge>
                    {q.tags.map((t) => <Badge key={t}>{t}</Badge>)}
                  </div>

                  <p style={{
                    fontSize: 14.5, lineHeight: 1.65, color: 'var(--ink)',
                    margin: 0, marginBottom: 16, whiteSpace: 'pre-wrap',
                  }}>
                    {q.type === 'blank' ? renderPreview(q.content) : q.content}
                  </p>

                  {lastAttempt?.userAnswer && (
                    <div style={{ marginBottom: 10 }}>
                      <p className="eh-field-label" style={{ marginBottom: 6 }}>내 답변</p>
                      <p style={{
                        fontSize: 13, color: 'var(--bad)',
                        background: 'var(--bad-soft)',
                        padding: '10px 12px', borderRadius: 8,
                        margin: 0, borderLeft: '2px solid var(--bad)',
                      }}>
                        {lastAttempt.userAnswer}
                      </p>
                    </div>
                  )}

                  {correctAnswers && (
                    <div>
                      <p className="eh-field-label" style={{ marginBottom: 6 }}>
                        {q.type === 'blank' ? '정답' : '모범 답안'}
                      </p>
                      <p style={{
                        fontSize: 13, color: 'var(--ok)',
                        background: 'var(--ok-soft)',
                        padding: '10px 12px', borderRadius: 8,
                        margin: 0, borderLeft: '2px solid var(--ok)',
                        whiteSpace: 'pre-wrap',
                      }}>
                        {correctAnswers}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
