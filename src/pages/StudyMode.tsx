import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useExamSets } from '../hooks/useExamSets';
import { useStudySession } from '../hooks/useStudySession';
import { ProgressBar } from '../components/common/ProgressBar';
import { BlankInput } from '../components/study/BlankInput';
import { EssayInput } from '../components/study/EssayInput';
import { ResultSummary } from '../components/study/ResultSummary';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/common/Button';
import { parseBlankContent, extractAnswers, checkAnswer } from '../utils/blank-parser';
import { isDueForReview } from '../utils/spaced-repetition';
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

  const filter = searchParams.get('filter') ?? 'all';
  const set = getSet(setId!);
  const studyQuestions = set ? prepareQuestions(set.questions, filter) : [];

  const session = useStudySession(studyQuestions);

  const [blankValues, setBlankValues] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const { currentQuestion, currentIndex, total, finished, pendingUpdates, correctCount, wrongQuestions } = session;

  // apply pending updates to storage when question changes or session finishes
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
  }, [currentIndex]);

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

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowRight' && submitted) session.next();
      if (e.key === 'ArrowLeft') session.prev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [submitted, session]);

  if (!set) return null;

  if (studyQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <EmptyState
          icon="✅"
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={() => navigate(`/set/${setId}`)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
          >
            ✕
          </button>
          <div className="flex-1">
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-1">
              <span>{currentIndex + 1} / {total}</span>
              <span>
                {currentQuestion.type === 'blank' ? '단답형' : '서술형'}
                {isDueForReview(currentQuestion) && (
                  <span className="ml-2 text-orange-500">복습</span>
                )}
              </span>
            </div>
            <ProgressBar value={currentIndex + 1} max={total} />
          </div>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          {currentQuestion.type === 'blank' ? (
            <div className="space-y-5">
              <BlankInput
                parts={parts}
                values={blankValues}
                onChange={setBlankValues}
                submitted={submitted}
                correctAnswers={answers}
                onSubmit={handleBlankSubmit}
              />

              {!submitted ? (
                <Button className="w-full" onClick={handleBlankSubmit}>
                  확인 (Enter)
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className={`text-center py-2 rounded-lg font-medium ${
                    answers.every((ans, i) => checkAnswer(blankValues[i] ?? '', ans))
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {answers.every((ans, i) => checkAnswer(blankValues[i] ?? '', ans))
                      ? '정답입니다! 🎉'
                      : '오답입니다. 정답을 확인하세요.'}
                  </div>
                  <Button className="w-full" onClick={session.next}>
                    다음 (→)
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-5">
              <p className="text-base text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                {currentQuestion.content}
              </p>
              <EssayInput
                modelAnswer={currentQuestion.answer}
                onEvaluate={handleEssayEval}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
