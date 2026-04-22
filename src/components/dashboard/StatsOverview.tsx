import type { ExamSet } from '../../types';
import { isDueForReview } from '../../utils/spaced-repetition';

interface StatsOverviewProps {
  sets: ExamSet[];
}

export function StatsOverview({ sets }: StatsOverviewProps) {
  const allQuestions = sets.flatMap((s) => s.questions);
  const total = allQuestions.length;
  const memorized = allQuestions.filter((q) => q.level === 3).length;
  const dueToday = allQuestions.filter(isDueForReview).length;
  const pct = total === 0 ? 0 : Math.round((memorized / total) * 100);

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{total}</div>
        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">전체 문제</div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
        <div className="text-2xl font-bold text-green-600">{pct}%</div>
        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">암기 완료</div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
        <div className={`text-2xl font-bold ${dueToday > 0 ? 'text-orange-500' : 'text-gray-900 dark:text-gray-100'}`}>
          {dueToday}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">오늘 복습</div>
      </div>
    </div>
  );
}
