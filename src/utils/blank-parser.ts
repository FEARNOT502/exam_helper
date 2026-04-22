export interface BlankPart {
  type: 'text' | 'blank';
  value: string;
}

export function parseBlankContent(content: string): BlankPart[] {
  const parts: BlankPart[] = [];
  const regex = /\{\{([^}]+)\}\}/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', value: content.slice(lastIndex, match.index) });
    }
    parts.push({ type: 'blank', value: match[1] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push({ type: 'text', value: content.slice(lastIndex) });
  }

  return parts;
}

export function extractAnswers(content: string): string[] {
  const matches = content.match(/\{\{([^}]+)\}\}/g) ?? [];
  return matches.map((m) => m.slice(2, -2));
}

export function renderPreview(content: string): string {
  return content.replace(/\{\{([^}]+)\}\}/g, '_____');
}

export function normalizeAnswer(answer: string): string {
  return answer.replace(/\s/g, '').toLowerCase();
}

export function checkAnswer(userAnswer: string, correctAnswer: string): boolean {
  return normalizeAnswer(userAnswer) === normalizeAnswer(correctAnswer);
}

export function wrapSelection(text: string, start: number, end: number): string {
  const selected = text.slice(start, end);
  if (!selected.trim()) return text;
  return text.slice(0, start) + `{{${selected}}}` + text.slice(end);
}
