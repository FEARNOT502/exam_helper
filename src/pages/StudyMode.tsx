import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useExamSetsContext as useExamSets } from '../context/ExamSetsContext';
import { useAuth } from '../context/AuthContext';
import { useStudySession } from '../hooks/useStudySession';
import { BlankInput } from '../components/study/BlankInput';
import { EssayInput } from '../components/study/EssayInput';
import { ResultSummary } from '../components/study/ResultSummary';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { parseBlankContent, extractAnswers, checkAnswer } from '../utils/blank-parser';
import { isDueForReview, getLevelLabel } from '../utils/spaced-repetition';
import { logStudySession } from '../lib/statsService';
import type { Question } from '../types';

function prepareQuestions(questions: Question[], filter: string): Question[] {
  let q = [...questions];
  if (filter === 'unlearned') q = q.filter((q) => q.level === 0);
  else if (filter === 'wrong') q = q.filter((q) => q.history.some((h) => !h.correct));
  if (filter === 'shuffle') q = q.sort(() => Math.random() - 0.5);
  return q;
}

export function StudyMode() {
  const { id: setId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { getSet, updateQuestion } = useExamSets();
  const { user } = useAuth();

  const filter = searchParams.get('filter') ?? 'all';
  const set = getSet(setId!);
  const studyQuestions = set ? prepareQuestions(set.questions, filter) : [];

  const session = useStudySession(studyQuestions);

  const [blankValues, setBlankValues] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [hintActive, setHintActive] = useState(false);
  const hintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessionStartedAt = useRef<number>(Date.now());
  const sessionLogged = useRef<boolean>(false);

  const { currentQuestion, currentIndex, total, finished, pendingUpdates, correctCount, wrongQuestions } = session;

  useEffect(() => {
    if (pendingUpdates.length === 0) return;
    const latest = pendingUpdates[pendingUpdates.length - 1];
    updateQuestion(setId!, latest.questionId, {
      ...latest.updates,
      history: [
        ...(set?.questions.find((q) => q.id === latest.questionId)?.history ?? []),
        latest.attempt,
      ],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingUpdates.length]);

  useEffect(() => {
    setBlankValues([]);
    setSubmitted(false);
    setHintActive(false);
    if (hintTimer.current) clearTimeout(hintTimer.current);
  }, [currentIndex]);

  const handleHint = useCallback(() => {
    if (submitted) return;
    if (hintTimer.current) clearTimeout(hintTimer.current);
    setHintActive(true);
    hintTimer.current = setTimeout(() => setHintActive(false), 3000);
  }, [submitted]);

  const handleBlankSubmit = useCallback(() => {
    if (!currentQuestion || submitted) return;
    const answers = extractAnswers(currentQuestion.content);
    const allCorrect = answers.every((ans, i) => checkAnswer(blankValues[i] ?? '', ans));
    session.submitAnswer(allCorrect, blankValues.join(', '));
    setSubmitted(true);
  }, [currentQuestion, submitted, blankValues, session]);

  const handleEssayEval = useCallback(
    (eval_: 'perfect' | 'partial' | 'wrong', userAnswer: string) => {
      const correct = eval_ !== 'wrong';
      session.submitAnswer(correct, userAnswer, eval_);
      session.next();
    },
    [session]
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowRight' && submitted) session.next();
      if (e.key === 'ArrowLeft') session.prev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [submitted, session]);

  useEffect(() => {
    if (!finished || sessionLogged.current || !setId) return;
    sessionLogged.current = true;
    const durationSec = Math.max(0, Math.round((Date.now() - sessionStartedAt.current) / 1000));
    logStudySession({
      userId: user?.id ?? null,
      setId,
      total,
      correct: correctCount,
      durationSec,
      mode: filter,
    }).catch(() => {});
  }, [finished, setId, total, correctCount, user?.id, filter]);

  if (!set) return null;

  if (studyQuestions.length === 0) {
    return (
      <div className="eh-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <EmptyState
          title="학습할 문제가 없습니다"
          description="선택한 필터에 해당하는 문제가 없습니다."
          actionLabel="돌아가기"
          onAction={() => navigate(`/set/${setId}`)}
        />
      </div>
    );
  }

  if (finished) {
    return (
      <div className="eh-shell">
        <ResultSummary
          setId={setId!}
          total={total}
          correctCount={correctCount}
          wrongQuestions={wrongQuestions}
          onRetryWrong={() => navigate(`/set/${setId}/study?filter=wrong`)}
        />
      </div>
    );
  }

  if (!currentQuestion) return null;

  const parts = currentQuestion.type === 'blank' ? parseBlankContent(currentQuestion.content) : [];
  const answers = currentQuestion.type === 'blank' ? extractAnswers(currentQuestion.content) : [];
  const allCorrect = submitted && answers.every((ans, i) => checkAnswer(blankValues[i] ?? '', ans));
  const pct = Math.round(((currentIndex) / total) * 100);

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
              aria-label="학습 종료"
              title="학습 종료"
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M4 4l8 8M12 4l-8 8"/></svg>
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="eh-bar" style={{ height: 3 }}>
                <span style={{ width: `${pct}%`, background: 'var(--ink)' }} />
              </div>
            </div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              color: 'var(--ink-3)',
              fontVariantNumeric: 'tabular-nums',
              minWidth: 56,
              textAlign: 'right',
            }}>
              {String(currentIndex + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
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
          {isDueForReview(currentQuestion) && <Badge className="eh-chip-warn">복습</Badge>}
          {currentQuestion.tags.map((t) => <Badge key={t}>{t}</Badge>)}
        </div>

        {/* Card */}
        <div className="eh-card" style={{ padding: '32px 28px' }}>
          {currentQuestion.type === 'blank' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <BlankInput
                key={currentQuestion.id}
                parts={parts}
                values={blankValues}
                onChange={setBlankValues}
                submitted={submitted}
                correctAnswers={answers}
                onSubmit={handleBlankSubmit}
                hintActive={hintActive}
              />

              {!submitted ? (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button
                    onClick={handleHint}
                    style={{
                      height: 44, padding: '0 14px',
                      border: '1px solid var(--line-strong)',
                      borderRadius: 12,
                      background: hintActive ? 'var(--warn-soft)' : 'var(--surface)',
                      color: hintActive ? 'oklch(45% 0.12 68)' : 'var(--ink-3)',
                      fontSize: 12.5, fontWeight: 500, cursor: 'pointer',
                      transition: 'all .15s', fontFamily: 'inherit',
                      flexShrink: 0,
                    }}
                    title="3초간 정답 표시"
                  >
                    {hintActive ? '힌트 중...' : '힌트'}
                  </button>
                  <Button size="lg" onClick={handleBlankSubmit} style={{ flex: 1 }}>
                    확인
                  </Button>
                  <span className="eh-mono eh-muted-2" style={{ fontSize: 11 }}>Enter</span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '12px 16px',
                    borderRadius: 10,
                    background: allCorrect ? 'var(--ok-soft)' : 'var(--bad-soft)',
                    color: allCorrect ? 'var(--ok)' : 'var(--bad)',
                    fontSize: 13.5,
                    fontWeight: 500,
                  }}>
                    <span className="eh-dot" />
                    {allCorrect ? '정답입니다.' : '오답입니다. 정답을 확인하세요.'}
                  </div>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <Button size="lg" className="w-full" onClick={session.next} style={{ flex: 1 }}>
                      다음 문제
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3l5 5-5 5"/></svg>
                    </Button>
                    <span className="eh-mono eh-muted-2" style={{ fontSize: 11 }}>→</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
              <p style={{
                fontSize: 16, lineHeight: 1.7, color: 'var(--ink)',
                whiteSpace: 'pre-wrap', margin: 0,
              }}>
                {currentQuestion.content}
              </p>
              <hr className="eh-divider" />
              <EssayInput
                key={currentQuestion.id}
                modelAnswer={currentQuestion.answer}
                onEvaluate={handleEssayEval}
                hintActive={hintActive}
              />
              {/* 서술형 힌트 버튼 */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: -8 }}>
                <button
                  onClick={handleHint}
                  style={{
                    height: 30, padding: '0 11px',
                    border: '1px solid var(--line-strong)',
                    borderRadius: 8,
                    background: hintActive ? 'var(--warn-soft)' : 'var(--surface)',
                    color: hintActive ? 'oklch(45% 0.12 68)' : 'var(--ink-3)',
                    fontSize: 12, fontWeight: 500, cursor: 'pointer',
                    transition: 'all .15s', fontFamily: 'inherit',
                  }}
                  title="3초간 모범답안 표시"
                >
                  {hintActive ? '힌트 중...' : '힌트 보기'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
