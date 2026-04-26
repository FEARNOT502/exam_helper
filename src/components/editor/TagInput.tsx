import { useState, type KeyboardEvent } from 'react';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
}

export function TagInput({ tags, onChange }: TagInputProps) {
  const [input, setInput] = useState('');

  const addTag = (value: string) => {
    const newTags = value
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t && !tags.includes(t));
    if (newTags.length > 0) onChange([...tags, ...newTags]);
    setInput('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(input);
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  const removeTag = (tag: string) => onChange(tags.filter((t) => t !== tag));

  return (
    <div
      className="flex flex-wrap gap-1.5"
      style={{
        padding: '7px 10px',
        background: 'var(--surface)',
        border: '1px solid var(--line-strong)',
        borderRadius: 10,
      }}
    >
      {tags.map((tag) => (
        <span
          key={tag}
          className="eh-chip"
          style={{ height: 24, paddingRight: 4, background: 'var(--accent-soft)', color: 'var(--accent-ink)', border: 'none' }}
        >
          {tag}
          <button
            type="button"
            onClick={() => removeTag(tag)}
            style={{ marginLeft: 4, padding: 2, opacity: 0.7, background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
          >
            ×
          </button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => input.trim() && addTag(input)}
        placeholder={tags.length === 0 ? '태그 입력 후 Enter' : ''}
        style={{
          flex: 1,
          minWidth: 100,
          outline: 'none',
          border: 'none',
          background: 'transparent',
          padding: '4px 2px',
          fontSize: 13.5,
          color: 'var(--ink)',
          fontFamily: 'inherit',
        }}
      />
    </div>
  );
}
