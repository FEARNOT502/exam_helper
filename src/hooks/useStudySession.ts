import { useState, useCallback } from 'react';
import type { Question, AttemptRecord } from '../types';
import { updateQuestionLevel } from '../utils/spaced-repetition';

interface SessionResult {
  questionId: string;
  correct: boolean;
  userAnswer: string;
}

export function useStudySession(initialQuestions: Question[]) {
  const [questions] = useState<Question[]>(initialQuestions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<SessionResult[]>([]);
  const [finished, setFinished] = useState(false);
  const [pendingUpdates, setPendingUpdates] = useState<
    { questionId: string; updates: Partial<Question>; attempt: AttemptRecord }[]
  >([]);

  const currentQuestion = questions[currentIndex] ?? null;
  const isLast = currentIndex >= questions.length - 1;

  const submitAnswer = useCallback(
    (
      correct: boolean,
      userAnswer: string,
      selfEval?: 'perfect' | 'partial' | 'wrong'
    ) => {
      if (!currentQuestion) return;

      const attempt: AttemptRecord = {
        date: Date.now(),
        correct,
        userAnswer,
      };

      const updates = updateQuestionLevel(currentQuestion, correct, selfEval);

      setPendingUpdates((prev) => [
        ...prev,
        { questionId: currentQuestion.id, updates, attempt },
      ]);

      setResults((prev) => [
        ...prev,
        { questionId: currentQuestion.id, correct, userAnswer },
      ]);
    },
    [currentQuestion]
  );

  const next = useCallback(() => {
    if (isLast) {
      setFinished(true);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }, [isLast]);

  const prev = useCallback(() => {
    setCurrentIndex((i) => Math.max(0, i - 1));
  }, []);

  const correctCount = results.filter((r) => r.correct).length;
  const wrongQuestions = questions.filter((q) =>
    results.find((r) => r.questionId === q.id && !r.correct)
  );

  return {
    currentQuestion,
    currentIndex,
    total: questions.length,
    results,
    finished,
    pendingUpdates,
    correctCount,
    wrongQuestions,
    submitAnswer,
    next,
    prev,
  };
}
