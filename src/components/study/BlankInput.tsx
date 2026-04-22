import { useRef, useEffect } from 'react';
import type { BlankPart } from '../../utils/blank-parser';

interface BlankInputProps {
  parts: BlankPart[];
  values: string[];
  onChange: (values: string[]) => void;
  submitted: boolean;
  correctAnswers: string[];
  onSubmit: () => void;
}

export function BlankInput({
  parts,
  values,
  onChange,
  submitted,
  correctAnswers,
  onSubmit,
}: BlankInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  let blankIndex = 0;

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const next = inputRefs.current[idx + 1];
      if (next) next.focus();
      else onSubmit();
    } else if (e.key === 'Enter') {
      onSubmit();
    }
  };

  return (
    <p className="text-base text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
      {parts.map((part, i) => {
        if (part.type === 'text') {
          return <span key={i}>{part.value}</span>;
        }
        const bIdx = blankIndex++;
        const userVal = values[bIdx] ?? '';
        const correct = correctAnswers[bIdx];
        const isCorrect =
          submitted &&
          userVal.replace(/\s/g, '').toLowerCase() === correct.replace(/\s/g, '').toLowerCase();
        const isWrong = submitted && !isCorrect;

        return (
          <span key={i} className="inline-flex flex-col items-center mx-0.5">
            <input
              ref={(el) => {
                inputRefs.current[bIdx] = el;
              }}
              type="text"
              value={userVal}
              disabled={submitted}
              onChange={(e) => {
                const next = [...values];
                next[bIdx] = e.target.value;
                onChange(next);
              }}
              onKeyDown={(e) => handleKeyDown(e, bIdx)}
              className={`
                border-b-2 text-center outline-none bg-transparent text-base min-w-16 px-1
                transition-colors
                ${submitted
                  ? isCorrect
                    ? 'border-green-500 text-green-700 dark:text-green-400'
                    : 'border-red-500 text-red-600 dark:text-red-400'
                  : 'border-gray-400 dark:border-gray-500 focus:border-blue-500'}
              `}
              style={{ width: `${Math.max(4, correct.length) * 0.75 + 2}rem` }}
            />
            {isWrong && (
              <span className="text-xs text-green-700 dark:text-green-400 mt-0.5 font-medium">
                {correct}
              </span>
            )}
          </span>
        );
      })}
    </p>
  );
}
