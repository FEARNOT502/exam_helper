import { useParams, useNavigate } from 'react-router-dom';
import { useExamSets } from '../hooks/useExamSets';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { getLevelLabel, getLevelColor } from '../utils/spaced-repetition';
import { renderPreview } from '../utils/blank-parser';

export function WrongNotes() {
  const { id: setId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getSet } = useExamSets();

  const set = getSet(setId!);
  if (!set) return null;

  const wrongQuestions = set.questions.filter((q) =>
    q.history.length > 0 && q.history[q.history.length - 1] && !q.history[q.history.length - 1].correct
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(`/set/${setId}`)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
          >
            ←
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">오답 노트</h1>
          <span className="text-sm text-gray-500 dark:text-gray-400">— {set.title}</span>
        </div>

        {wrongQuestions.length === 0 ? (
          <EmptyState
            icon="✅"
            title="오답 문제가 없습니다"
            description="모든 문제를 정답 처리했습니다. 훌륭해요!"
            actionLabel="학습하러 가기"
            onAction={() => navigate(`/set/${setId}/study?filter=all`)}
          />
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {wrongQuestions.length}개의 오답 문제
              </p>
              <Button
                size="sm"
                onClick={() => navigate(`/set/${setId}/study?filter=wrong`)}
              >
                재학습 시작
              </Button>
            </div>

            {wrongQuestions.map((q) => {
              const lastAttempt = q.history[q.history.length - 1];
              return (
                <div
                  key={q.id}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5"
                >
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge
                      className={
                        q.type === 'blank'
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
                          : 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300'
                      }
                    >
                      {q.type === 'blank' ? '단답형' : '서술형'}
                    </Badge>
                    <Badge className={getLevelColor(q.level)}>{getLevelLabel(q.level)}</Badge>
                  </div>

                  <p className="text-sm text-gray-800 dark:text-gray-200 mb-3 whitespace-pre-wrap leading-relaxed">
                    {q.type === 'blank' ? renderPreview(q.content) : q.content}
                  </p>

                  {lastAttempt?.userAnswer && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-400 mb-1">내 답변</p>
                      <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
                        {lastAttempt.userAnswer}
                      </p>
                    </div>
                  )}

                  {q.type === 'blank' && (
                    <div>
                      <p className="text-xs text-gray-400 mb-1">정답</p>
                      <p className="text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg">
                        {q.content.match(/\{\{([^}]+)\}\}/g)?.map((m) => m.slice(2, -2)).join(', ')}
                      </p>
                    </div>
                  )}

                  {q.type === 'essay' && q.answer && (
                    <div>
                      <p className="text-xs text-gray-400 mb-1">모범 답안</p>
                      <p className="text-sm text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg whitespace-pre-wrap">
                        {q.answer}
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
