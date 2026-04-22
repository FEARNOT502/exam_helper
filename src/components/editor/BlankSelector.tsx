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
    <div className="space-y-2">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onMouseUp={handleMouseUp}
        rows={5}
        placeholder="문제 텍스트를 입력하세요. 정답 키워드를 드래그해서 선택하면 {{키워드}} 형식으로 자동 변환됩니다."
        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
      />
      {value && (
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">미리보기</p>
          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {renderPreview(value) || <span className="italic text-gray-400">빈칸 없음</span>}
          </p>
        </div>
      )}
    </div>
  );
}
