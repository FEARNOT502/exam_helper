import { useState } from 'react';
import { Button } from '../common/Button';
import { computeSimilarity } from '../../utils/blank-parser';

interface EssayInputProps {
  modelAnswer?: string;
  onEvaluate: (eval_: 'perfect' | 'partial' | 'wrong', answer: string) => void;
  hintActive?: boolean;
}

export function EssayInput({ modelAnswer, onEvaluate, hintActive = false }: EssayInputProps) {
  const [answer, setAnswer] = useState('');
  const [revealed, setRevealed] = useState(false);

  const similarity = revealed && modelAnswer ? computeSimilarity(answer, modelAnswer) : null;
  const suggested: 'perfect' | 'partial' | 'wrong' | null =
    similarity === null ? null
    : similarity >= 80 ? 'perfect'
    : similarity >= 40 ? 'partial'
    : 'wrong';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* 힌트 오버레이 */}
      {hintActive && !revealed && modelAnswer && (
        <div style={{
          padding: '12px 14px',
          background: 'var(--warn-soft)',
          border: '1px solid var(--warn)',
          borderRadius: 10,
          animation: 'eh-fade-in .15s ease',
        }}>
          <p style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'oklch(45% 0.12 68)', fontWeight: 600, letterSpacing: '.04em', textTransform: 'uppercase', margin: '0 0 6px' }}>
            힌트
          </p>
          <p style={{ fontSize: 13.5, lineHeight: 1.6, color: 'oklch(38% 0.1 68)', margin: 0, whiteSpace: 'pre-wrap' }}>
            {modelAnswer}
          </p>
        </div>
      )}

      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        disabled={revealed}
        rows={6}
        placeholder="자신의 말로 답변을 작성하세요. 이후 모범답안과 비교해 채점합니다."
        className="eh-textarea"
        style={{ fontSize: 14.5, lineHeight: 1.65 }}
      />

      {!revealed ? (
        <Button className="w-full" onClick={() => setRevealed(true)}>
          모범답안 확인
        </Button>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {modelAnswer && (
            <div style={{
              padding: 16,
              background: 'var(--accent-soft)',
              borderRadius: 12,
            }}>
              <p className="eh-field-label" style={{ color: 'var(--accent-ink)', marginBottom: 8 }}>
                모범 답안
              </p>
              <p style={{ fontSize: 14, lineHeight: 1.65, color: 'var(--accent-ink)', margin: 0, whiteSpace: 'pre-wrap' }}>
                {modelAnswer}
              </p>
            </div>
          )}

          {/* 유사도 */}
          {similarity !== null && modelAnswer && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 14px',
              background: 'var(--surface-2)',
              borderRadius: 10,
              border: '1px solid var(--line)',
            }}>
              <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--ink-3)', letterSpacing: '.04em', textTransform: 'uppercase' }}>
                유사도
              </span>
              <span style={{
                fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-mono)',
                color: similarity >= 80 ? 'var(--ok)' : similarity >= 40 ? 'oklch(52% 0.13 68)' : 'var(--bad)',
                letterSpacing: '-.02em',
              }}>
                {similarity}%
              </span>
              <span style={{ fontSize: 12, color: 'var(--ink-4)' }}>
                {suggested === 'perfect' ? '— 정답 추천' : suggested === 'partial' ? '— 부분정답 추천' : '— 오답 추천'}
              </span>
            </div>
          )}

          <div>
            <p className="eh-field-label" style={{ textAlign: 'center', marginBottom: 10 }}>
              자기 평가
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              <SelfScoreBtn tone="ok" label="정답" suggested={suggested === 'perfect'} onClick={() => onEvaluate('perfect', answer)} />
              <SelfScoreBtn tone="warn" label="부분정답" suggested={suggested === 'partial'} onClick={() => onEvaluate('partial', answer)} />
              <SelfScoreBtn tone="bad" label="오답" suggested={suggested === 'wrong'} onClick={() => onEvaluate('wrong', answer)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SelfScoreBtn({
  tone,
  label,
  suggested,
  onClick,
}: {
  tone: 'ok' | 'warn' | 'bad';
  label: string;
  suggested: boolean;
  onClick: () => void;
}) {
  const bg = tone === 'ok' ? 'var(--ok-soft)' : tone === 'warn' ? 'var(--warn-soft)' : 'var(--bad-soft)';
  const fg =
    tone === 'ok'
      ? 'var(--ok)'
      : tone === 'warn'
        ? 'oklch(45% 0.12 68)'
        : 'var(--bad)';
  const border = tone === 'ok' ? 'var(--ok)' : tone === 'warn' ? 'var(--warn)' : 'var(--bad)';

  return (
    <button
      onClick={onClick}
      style={{
        padding: '14px 12px',
        border: suggested ? `2px solid ${border}` : '2px solid transparent',
        borderRadius: 12,
        background: bg,
        color: fg,
        fontSize: 13.5,
        fontWeight: suggested ? 700 : 500,
        cursor: 'pointer',
        transition: 'filter .12s',
        fontFamily: 'inherit',
        position: 'relative',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(.97)')}
      onMouseLeave={(e) => (e.currentTarget.style.filter = '')}
    >
      <span className="eh-dot" style={{ display: 'inline-block', marginRight: 6, verticalAlign: 'middle' }} />
      {label}
      {suggested && (
        <span style={{
          position: 'absolute', top: -8, right: 6,
          fontSize: 10, fontFamily: 'var(--font-mono)',
          background: border, color: 'white',
          padding: '1px 5px', borderRadius: 4,
        }}>추천</span>
      )}
    </button>
  );
}
