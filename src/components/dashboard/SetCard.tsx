import { useNavigate } from 'react-router-dom';
import type { ExamSet } from '../../types';
import { ProgressBar } from '../common/ProgressBar';
import { Badge } from '../common/Badge';
import { isDueForReview } from '../../utils/spaced-repetition';

interface SetCardProps {
  set: ExamSet;
  onDelete: (id: string) => void;
}

export function SetCard({ set, onDelete }: SetCardProps) {
  const navigate = useNavigate();
  const total = set.questions.length;
  const memorized = set.questions.filter((q) => q.level === 3).length;
  const dueCount = set.questions.filter(isDueForReview).length;

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => navigate(`/set/${set.id}`)}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate text-base">
            {set.title}
          </h3>
          {set.subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5">
              {set.subtitle}
            </p>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(set.id);
          }}
          className="shrink-0 text-gray-400 hover:text-red-500 transition-colors p-1 rounded"
          title="삭제"
        >
          ✕
        </button>
      </div>

      <div className="flex flex-wrap gap-1 mb-3">
        {set.tags.map((tag) => (
          <Badge key={tag} className="bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
            {tag}
          </Badge>
        ))}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>총 {total}문제</span>
          <span>암기 {memorized}/{total}</span>
        </div>
        <ProgressBar value={memorized} max={total} colorClass="bg-green-500" />
      </div>

      {dueCount > 0 && (
        <div className="mt-3 text-xs font-medium text-orange-600 dark:text-orange-400">
          오늘 복습 {dueCount}문제 대기 중
        </div>
      )}
    </div>
  );
}
