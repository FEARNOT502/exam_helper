import { useRef, useEffect } from 'react';
import type { BlankPart } from '../../utils/blank-parser';

interface BlankInputProps {
  parts: BlankPart[];
  values: string[];
  onChange: (values: string[]) => void;
  submitted: boolean;
  correctAnswers: string[];
  onSubmit: () => void;
  hintActive?: boolean;
}

export function BlankInput({
  parts,
  values,
  onChange,
  submitted,
  correctAnswers,
  onSubmit,
  hintActive = false,
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    {hintActive && !submitted && (
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center',
        padding: '8px 12px',
        background: 'var(--warn-soft)',
        border: '1px solid var(--warn)',
        borderRadius: 8,
        animation: 'eh-fade-in .15s ease',
      }}>
        <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'oklch(45% 0.12 68)', fontWeight: 600, letterSpacing: '.04em', textTransform: 'uppercase' }}>힌트</span>
        {correctAnswers.map((ans, i) => (
          <span key={i} style={{
            fontSize: 13, fontWeight: 600, color: 'oklch(45% 0.12 68)',
            background: 'var(--warn)', opacity: .9,
            padding: '2px 8px', borderRadius: 5,
          }}>{ans}</span>
        ))}
      </div>
    )}
    <p style={{ fontSize: 15.5, lineHeight: 2, color: 'var(--ink-2)', whiteSpace: 'pre-wrap', margin: 0 }}>
      {parts.map((part, i) => {
        if (part.type === 'text') return <span key={i}>{part.value}</span>;
        const bIdx = blankIndex++;
        const userVal = values[bIdx] ?? '';
        const correct = correctAnswers[bIdx];
        const isCorrect =
          submitted &&
          userVal.replace(/\s/g, '').toLowerCase() === correct.replace(/\s/g, '').toLowerCase();
        const isWrong = submitted && !isCorrect;

        let borderColor = 'var(--line-strong)';
        let color = 'var(--ink)';
        if (submitted && isCorrect) {
          borderColor = 'var(--ok)';
          color = 'var(--ok)';
        } else if (isWrong) {
          borderColor = 'var(--bad)';
          color = 'var(--bad)';
        }

        return (
          <span key={i} style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', margin: '0 3px', verticalAlign: 'baseline' }}>
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
              style={{
                borderBottom: `1.5px solid ${borderColor}`,
                textAlign: 'center',
                outline: 'none',
                background: 'transparent',
                fontSize: 15,
                minWidth: 64,
                padding: '2px 6px',
                color,
                fontFamily: 'inherit',
                border: 'none',
                borderBottomWidth: 1.5,
                borderBottomStyle: 'solid',
                borderBottomColor: borderColor,
                transition: 'border-color .15s',
                width: `${Math.max(4, correct.length) * 0.75 + 2}rem`,
              }}
            />
            {isWrong && (
              <span style={{ fontSize: 11, color: 'var(--ok)', marginTop: 2, fontWeight: 500, fontFamily: 'var(--font-mono)' }}>
                {correct}
              </span>
            )}
          </span>
        );
      })}
    </p>
    </div>
  );
}
