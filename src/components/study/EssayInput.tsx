import { useState } from 'react';
import { Button } from '../common/Button';

interface EssayInputProps {
  modelAnswer?: string;
  onEvaluate: (eval_: 'perfect' | 'partial' | 'wrong', answer: string) => void;
}

export function EssayInput({ modelAnswer, onEvaluate }: EssayInputProps) {
  const [answer, setAnswer] = useState('');
  const [revealed, setRevealed] = useState(false);

  const handleReveal = () => {
    setRevealed(true);
  };

  return (
    <div className="space-y-4">
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        disabled={revealed}
        rows={6}
        placeholder="답안을 작성하세요..."
        className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm leading-relaxed"
      />

      {!revealed ? (
        <Button className="w-full" onClick={handleReveal}>
          답안 확인
        </Button>
      ) : (
        <div className="space-y-4">
          {modelAnswer && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2">모범 답안</p>
              <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                {modelAnswer}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
              자기 평가
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => onEvaluate('perfect', answer)}
                className="flex flex-col items-center gap-1 p-3 rounded-xl border-2 border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-700 hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
              >
                <span className="text-2xl">✅</span>
                <span className="text-xs font-medium text-green-700 dark:text-green-400">완벽함</span>
              </button>
              <button
                onClick={() => onEvaluate('partial', answer)}
                className="flex flex-col items-center gap-1 p-3 rounded-xl border-2 border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-700 hover:bg-yellow-100 dark:hover:bg-yellow-900/40 transition-colors"
              >
                <span className="text-2xl">🔶</span>
                <span className="text-xs font-medium text-yellow-700 dark:text-yellow-400">부분 정답</span>
              </button>
              <button
                onClick={() => onEvaluate('wrong', answer)}
                className="flex flex-col items-center gap-1 p-3 rounded-xl border-2 border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-700 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
              >
                <span className="text-2xl">❌</span>
                <span className="text-xs font-medium text-red-700 dark:text-red-400">모르겠음</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
