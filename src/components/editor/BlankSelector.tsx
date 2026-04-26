import { useRef } from 'react';
import { renderPreview, wrapSelection } from '../../utils/blank-parser';

interface BlankSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function BlankSelector({ value, onChange }: BlankSelectorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleMouseUp = () => {
    const el = textareaRef.current;
    if (!el) return;
    const { selectionStart, selectionEnd } = el;
    if (selectionStart === selectionEnd) return;
    const newValue = wrapSelection(value, selectionStart, selectionEnd);
    if (newValue !== value) {
      onChange(newValue);
      setTimeout(() => {
        el.setSelectionRange(selectionStart, selectionStart);
      }, 0);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onMouseUp={handleMouseUp}
        rows={5}
        placeholder="문제 텍스트를 입력하세요. 정답 키워드를 드래그하면 {{키워드}} 형식으로 자동 변환됩니다."
        className="eh-textarea"
      />
      {value && (
        <div
          style={{
            padding: 14,
            background: 'var(--surface-2)',
            border: '1px solid var(--line)',
            borderRadius: 12,
          }}
        >
          <p className="eh-field-label" style={{ marginBottom: 6 }}>미리보기</p>
          <p style={{ fontSize: 14, lineHeight: 1.65, color: 'var(--ink-2)', margin: 0, whiteSpace: 'pre-wrap' }}>
            {renderPreview(value) || <span style={{ color: 'var(--ink-4)', fontStyle: 'italic' }}>빈칸 없음</span>}
          </p>
        </div>
      )}
    </div>
  );
}
