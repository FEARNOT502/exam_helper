import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useExamSetsContext as useExamSets } from '../context/ExamSetsContext';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { parseBlankContent, extractAnswers, normalizeAnswer } from '../utils/blank-parser';
import { getLevelLabel } from '../utils/spaced-repetition';
import type { Question } from '../types';

export function PracticeMode() {
  const { id: setId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getSet } = useExamSets();

  const set = getSet(setId!);
  const questions = set?.questions ?? [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [finished, setFinished] = useState(false);

  const currentQuestion = questions[currentIndex] ?? null;
  const total = questions.length;
  const pct = total === 0 ? 0 : Math.round((currentIndex / total) * 100);

  const goNext = useCallback(() => {
    if (currentIndex >= total - 1) {
      setFinished(true);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }, [currentIndex, total]);

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => Math.max(0, i - 1));
  }, []);

  // keyboard nav (when not inside input/textarea)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goPrev]);

  if (!set) return null;

  if (total === 0) {
    return (
      <div className="eh-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <EmptyState
          title="연습할 문제가 없습니다"
          description="먼저 문제를 추가해 주세요."
          actionLabel="돌아가기"
          onAction={() => navigate(`/set/${setId}`)}
        />
      </div>
    );
  }

  if (finished) {
    return (
      <div className="eh-shell">
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '48px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="eh-card" style={{ padding: '40px 28px', textAlign: 'center' }}>
            <div style={{
              width: 64, height: 64, borderRadius: 18,
              background: 'var(--ok-soft)', display: 'grid', placeItems: 'center',
              margin: '0 auto 18px', fontSize: 28,
            }}>
              ✏️
            </div>
            <p className="eh-field-label" style={{ marginBottom: 6 }}>연습 완료</p>
            <div style={{
              fontSize: 48, fontWeight: 300, letterSpacing: '-.04em',
              color: 'var(--ink)', lineHeight: 1, marginBottom: 8,
              fontVariantNumeric: 'tabular-nums',
            }}>
              {total}
              <span style={{ fontSize: 20, color: 'var(--ink-3)', fontWeight: 400 }}>문제</span>
            </div>
            <p className="eh-muted" style={{ fontSize: 13, margin: 0, lineHeight: 1.55 }}>
              모든 문제를 따라 써 보았습니다. 반복할수록 기억에 오래 남습니다!
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Button className="w-full" onClick={() => { setCurrentIndex(0); setFinished(false); }}>
              처음부터 다시 연습
            </Button>
            <Button variant="secondary" className="w-full" onClick={() => navigate(`/set/${setId}`)}>
              족보로 돌아가기
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => navigate('/')}>
              홈으로
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) return null;

  return (
    <div className="eh-shell">
      {/* Top progress bar */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: 'var(--bg)',
        borderBottom: '1px solid var(--line)',
      }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '14px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button
              onClick={() => navigate(`/set/${setId}`)}
              className="eh-icon-btn eh-icon-btn-sm"
              aria-label="연습 종료"
              title="연습 종료"
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M4 4l8 8M12 4l-8 8"/></svg>
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="eh-bar" style={{ height: 3 }}>
                <span style={{ width: `${pct}%`, background: 'var(--accent)' }} />
              </div>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{
                fontSize: 10.5, fontFamily: 'var(--font-mono)', fontWeight: 600,
                letterSpacing: '.06em', textTransform: 'uppercase',
                color: 'var(--accent-ink)', background: 'var(--accent-soft)',
                padding: '3px 8px', borderRadius: 5,
              }}>
                연습
              </span>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 12,
                color: 'var(--ink-3)', fontVariantNumeric: 'tabular-nums',
                minWidth: 56, textAlign: 'right',
              }}>
                {String(currentIndex + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="page-container" style={{ maxWidth: 720, margin: '0 auto', padding: '36px 24px 64px' }}>
        {/* Question meta */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 18, flexWrap: 'wrap' }}>
          <Badge className={currentQuestion.type === 'blank' ? 'eh-chip-blank' : 'eh-chip-essay'}>
            {currentQuestion.type === 'blank' ? '단답형' : '서술형'}
          </Badge>
          <Badge>{getLevelLabel(currentQuestion.level)}</Badge>
          {currentQuestion.tags.map((t) => <Badge key={t}>{t}</Badge>)}
        </div>

        {/* Card */}
        <div className="eh-card" style={{ padding: '32px 28px' }}>
          {currentQuestion.type === 'blank' ? (
            <BlankPractice
              key={currentQuestion.id}
              question={currentQuestion}
              onComplete={goNext}
            />
          ) : (
            <EssayPractice
              key={currentQuestion.id}
              question={currentQuestion}
              onComplete={goNext}
            />
          )}
        </div>

        {/* Nav buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
          <button
            onClick={goPrev}
            disabled={currentIndex === 0}
            className="eh-icon-btn"
            style={{ opacity: currentIndex === 0 ? 0.3 : 1 }}
            aria-label="이전 문제"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3L5 8l5 5"/></svg>
          </button>
          <span className="eh-mono eh-muted-2" style={{ fontSize: 11 }}>
            정답을 따라 입력하면 자동으로 넘어갑니다
          </span>
          <button
            onClick={goNext}
            className="eh-icon-btn"
            aria-label="다음 문제"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3l5 5-5 5"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ──────────── Blank Practice ──────────── */

function BlankPractice({
  question,
  onComplete,
}: {
  question: Question;
  onComplete: () => void;
}) {
  const parts = parseBlankContent(question.content);
  const answers = extractAnswers(question.content);
  const [values, setValues] = useState<string[]>(() => answers.map(() => ''));
  const [completed, setCompleted] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const completeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    inputRefs.current[0]?.focus();
    return () => { if (completeTimer.current) clearTimeout(completeTimer.current); };
  }, []);

  // check if all blanks match
  useEffect(() => {
    if (completed) return;
    const allCorrect = answers.every((ans, i) =>
      normalizeAnswer(values[i] ?? '') === normalizeAnswer(ans)
    );
    if (allCorrect && values.some((v) => v.trim().length > 0)) {
      setCompleted(true);
      completeTimer.current = setTimeout(onComplete, 1200);
    }
  }, [values, answers, completed, onComplete]);

  let blankIndex = 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* answer labels (shown) */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center',
        padding: '10px 14px',
        background: 'var(--accent-soft)',
        border: '1px solid var(--accent)',
        borderRadius: 10,
        animation: 'eh-fade-in .2s ease',
      }}>
        <span style={{
          fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--accent-ink)',
          fontWeight: 600, letterSpacing: '.04em', textTransform: 'uppercase',
        }}>정답</span>
        {answers.map((ans, i) => (
          <span key={i} style={{
            fontSize: 13, fontWeight: 600, color: 'var(--accent-ink)',
            background: 'var(--accent)', opacity: .85,
            padding: '2px 10px', borderRadius: 5,
          }}>{ans}</span>
        ))}
      </div>

      {/* question with blanks */}
      <p style={{ fontSize: 15.5, lineHeight: 2, color: 'var(--ink-2)', whiteSpace: 'pre-wrap', margin: 0 }}>
        {parts.map((part, i) => {
          if (part.type === 'text') return <span key={i}>{part.value}</span>;
          const bIdx = blankIndex++;
          const userVal = values[bIdx] ?? '';
          const correct = answers[bIdx];
          const isMatch = normalizeAnswer(userVal) === normalizeAnswer(correct);
          const isTyping = userVal.length > 0;

          let borderColor = 'var(--accent)';
          let textColor = 'var(--ink)';
          let bgColor = 'transparent';
          if (isMatch) {
            borderColor = 'var(--ok)';
            textColor = 'var(--ok)';
            bgColor = 'var(--ok-soft)';
          } else if (isTyping && !isMatch) {
            borderColor = 'var(--accent)';
            textColor = 'var(--ink)';
          }

          return (
            <span key={i} style={{
              display: 'inline-flex', flexDirection: 'column', alignItems: 'center',
              margin: '0 3px', verticalAlign: 'baseline',
            }}>
              <input
                ref={(el) => { inputRefs.current[bIdx] = el; }}
                type="text"
                value={userVal}
                disabled={isMatch}
                onChange={(e) => {
                  const next = [...values];
                  next[bIdx] = e.target.value;
                  setValues(next);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Tab') {
                    e.preventDefault();
                    // find next unfilled blank
                    for (let j = bIdx + 1; j < answers.length; j++) {
                      if (normalizeAnswer(values[j] ?? '') !== normalizeAnswer(answers[j])) {
                        inputRefs.current[j]?.focus();
                        return;
                      }
                    }
                  }
                }}
                placeholder={correct.replace(/./g, '·')}
                style={{
                  textAlign: 'center',
                  outline: 'none',
                  background: bgColor,
                  fontSize: 15,
                  minWidth: 64,
                  padding: '3px 8px',
                  color: textColor,
                  fontFamily: 'inherit',
                  fontWeight: isMatch ? 600 : 400,
                  border: 'none',
                  borderBottomWidth: 2,
                  borderBottomStyle: 'solid',
                  borderBottomColor: borderColor,
                  borderRadius: isMatch ? 4 : 0,
                  transition: 'all .2s ease',
                  width: `${Math.max(4, correct.length) * 0.75 + 2}rem`,
                }}
              />
              {isMatch && (
                <span style={{
                  fontSize: 10, color: 'var(--ok)', marginTop: 3,
                  fontFamily: 'var(--font-mono)', fontWeight: 600,
                }}>✓</span>
              )}
            </span>
          );
        })}
      </p>

      {/* completion indicator */}
      {completed && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 16px', borderRadius: 10,
          background: 'var(--ok-soft)', color: 'var(--ok)',
          fontSize: 13.5, fontWeight: 500,
          animation: 'eh-fade-in .2s ease',
        }}>
          <span className="eh-dot" />
          모두 정확하게 입력했습니다! 다음 문제로 이동합니다...
        </div>
      )}
    </div>
  );
}

/* ──────────── Essay Practice ──────────── */

function EssayPractice({
  question,
  onComplete,
}: {
  question: Question;
  onComplete: () => void;
}) {
  const modelAnswer = question.answer ?? '';
  const [userInput, setUserInput] = useState('');
  const [completed, setCompleted] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const completeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    textareaRef.current?.focus();
    return () => { if (completeTimer.current) clearTimeout(completeTimer.current); };
  }, []);

  // char-by-char matching for visual feedback
  const normalizedModel = modelAnswer.replace(/\s+/g, ' ').trim();
  const normalizedUser = userInput.replace(/\s+/g, ' ').trim();
  const matchRatio = normalizedModel.length === 0
    ? 0
    : Math.round((normalizedUser.length / normalizedModel.length) * 100);

  // Check completion
  useEffect(() => {
    if (completed || !modelAnswer) return;
    if (normalizedUser.length > 0 && normalizedUser === normalizedModel) {
      setCompleted(true);
      completeTimer.current = setTimeout(onComplete, 1500);
    }
  }, [normalizedUser, normalizedModel, completed, onComplete, modelAnswer]);

  // Build character comparison display
  const renderComparison = () => {
    if (!userInput.trim()) return null;
    const chars = normalizedModel.split('');
    return (
      <div style={{
        padding: '14px 16px',
        background: 'var(--surface-2)',
        border: '1px solid var(--line)',
        borderRadius: 10,
        fontSize: 14,
        lineHeight: 1.9,
        fontFamily: 'var(--font-mono)',
        letterSpacing: '.02em',
      }}>
        <p className="eh-field-label" style={{ marginBottom: 8 }}>매칭 결과</p>
        <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
          {chars.map((ch, i) => {
            const userCh = normalizedUser[i];
            let color = 'var(--ink-4)';   // not yet typed
            let bg = 'transparent';
            if (userCh !== undefined) {
              if (userCh === ch) {
                color = 'var(--ok)';
                bg = 'var(--ok-soft)';
              } else {
                color = 'var(--bad)';
                bg = 'var(--bad-soft)';
              }
            }
            return (
              <span key={i} style={{
                color, background: bg,
                padding: ch === ' ' ? '0 2px' : '0 1px',
                borderRadius: 2,
                transition: 'all .1s',
              }}>{ch}</span>
            );
          })}
        </p>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Question */}
      <p style={{
        fontSize: 16, lineHeight: 1.7, color: 'var(--ink)',
        whiteSpace: 'pre-wrap', margin: 0,
      }}>
        {question.content}
      </p>

      <hr className="eh-divider" />

      {/* Model answer (always visible) */}
      {modelAnswer ? (
        <div style={{
          padding: '14px 16px',
          background: 'var(--accent-soft)',
          borderRadius: 10,
          borderLeft: '3px solid var(--accent)',
        }}>
          <p className="eh-field-label" style={{ color: 'var(--accent-ink)', marginBottom: 6 }}>
            모범 답안 — 아래에 따라 써 보세요
          </p>
          <p style={{
            fontSize: 14, lineHeight: 1.65, color: 'var(--accent-ink)',
            margin: 0, whiteSpace: 'pre-wrap',
          }}>
            {modelAnswer}
          </p>
        </div>
      ) : (
        <div style={{
          padding: '14px 16px',
          background: 'var(--warn-soft)',
          borderRadius: 10,
          borderLeft: '3px solid var(--warn)',
        }}>
          <p style={{ fontSize: 13, color: 'oklch(45% 0.12 68)', margin: 0 }}>
            모범 답안이 등록되지 않은 문제입니다. 건너뛸 수 있습니다.
          </p>
        </div>
      )}

      {/* User input area */}
      <div>
        <label className="eh-field-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span>따라 쓰기</span>
          {modelAnswer && (
            <span style={{
              fontSize: 11, color: completed ? 'var(--ok)' : 'var(--ink-4)',
              fontWeight: completed ? 600 : 400,
              textTransform: 'none', letterSpacing: 0,
              fontFamily: 'var(--font-mono)',
            }}>
              {completed ? '✓ 완료!' : `${Math.min(100, matchRatio)}%`}
            </span>
          )}
        </label>
        {modelAnswer && (
          <div className="eh-bar eh-bar-ok" style={{ marginBottom: 10, height: 3 }}>
            <span style={{ width: `${Math.min(100, matchRatio)}%` }} />
          </div>
        )}
        <textarea
          ref={textareaRef}
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          disabled={completed}
          rows={6}
          placeholder="모범 답안을 보고 그대로 따라 써 보세요..."
          className="eh-textarea"
          style={{
            fontSize: 14.5, lineHeight: 1.65,
            borderColor: completed ? 'var(--ok)' : undefined,
          }}
        />
      </div>

      {/* Character comparison */}
      {modelAnswer && renderComparison()}

      {/* Completion message */}
      {completed && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 16px', borderRadius: 10,
          background: 'var(--ok-soft)', color: 'var(--ok)',
          fontSize: 13.5, fontWeight: 500,
          animation: 'eh-fade-in .2s ease',
        }}>
          <span className="eh-dot" />
          정확하게 따라 썼습니다! 다음 문제로 이동합니다...
        </div>
      )}

      {/* Skip button for no-answer essays */}
      {!modelAnswer && !completed && (
        <Button onClick={onComplete} variant="secondary" className="w-full">
          다음 문제로 건너뛰기 →
        </Button>
      )}
    </div>
  );
}
