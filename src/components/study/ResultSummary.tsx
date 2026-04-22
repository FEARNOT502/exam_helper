import { useNavigate } from 'react-router-dom';
import type { Question } from '../../types';
import { Button } from '../common/Button';
import { ProgressBar } from '../common/ProgressBar';
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

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 text-center">
        <div className="text-5xl mb-3">
          {correctCount === total ? '🎉' : correctCount >= total / 2 ? '👍' : '💪'}
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">학습 완료!</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
          {total}문제 중 {correctCount}문제 정답
        </p>
        <ProgressBar
          value={correctCount}
          max={total}
          colorClass={correctCount === total ? 'bg-green-500' : correctCount >= total / 2 ? 'bg-blue-500' : 'bg-orange-500'}
          className="mb-2"
        />
        <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
          {total === 0 ? '-' : Math.round((correctCount / total) * 100)}%
        </p>
      </div>

      {wrongQuestions.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
            틀린 문제 ({wrongQuestions.length})
          </h3>
          <div className="space-y-2">
            {wrongQuestions.map((q) => (
              <div
                key={q.id}
                className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
              >
                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                  {q.type === 'blank' ? renderPreview(q.content) : q.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
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
