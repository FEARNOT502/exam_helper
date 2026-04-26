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
  const a = normalizeAnswer(userAnswer);
  const b = normalizeAnswer(correctAnswer);
  if (!a || !b) return false;
  if (a === b) return true;
  // 어미만 다른 답안 허용 (예: "수행한다" / "수행하였다")
  return stemKorean(a) === stemKorean(b);
}

export function wrapSelection(text: string, start: number, end: number): string {
  const selected = text.slice(start, end);
  if (!selected.trim()) return text;
  return text.slice(0, start) + `{{${selected}}}` + text.slice(end);
}

// ============================================================
// Morpheme-aware similarity (한국어 어미/조사에 강건한 채점)
// ============================================================
//
// 전략:
//  1) 문장부호/공백 정규화
//  2) 토큰화 후 각 토큰의 어말 조사·어미를 반복 제거하여 "어간" 후보를 만든다
//     (예: "근로자는" → "근로자", "수행하였다" → "수행", "기업이라고" → "기업")
//  3) 어간 토큰 집합으로 recall-weighted Jaccard를 계산
//  4) 보너스: 어간이 짧아서 매칭에 실패한 경우 글자 bigram 유사도로 보강
//
// 이로써 "근로자는 근로계약을 체결한다" 와 "근로자가 근로계약을 체결하였다"
// 같이 어미만 다른 답안이 거의 100% 가깝게 평가된다.

const KOREAN_BLOCK = /[가-힣]/;

// 자주 쓰이는 조사/어미. 길이 내림차순으로 정렬해서 최장일치 우선 제거.
const SUFFIXES = [
  // 종결/연결어미
  '하였습니다', '하였었다', '하였다', '하였고', '하였으며', '되었다', '되었으며',
  '입니다', '이었다', '이었으며', '이었고', '습니다', '였습니다',
  '하면서', '하여서', '으면서', '면서', '하여', '하고', '하며', '한다', '한다는',
  '되며', '되고', '된다', '되어', '된다는', '됨으로', '되어서',
  '으로서', '으로써', '에서의', '에서는', '에서도', '에서', '에는', '에도', '으로', '로서', '로써',
  '이라고', '이라는', '이라면', '이라도', '라고', '라는', '라면', '라도', '이라', '라',
  // 시제/회상
  '었었다', '았었다', '였었다', '었다', '았다', '였다',
  // 부사형/명사형
  '하기', '되기', '하게', '되게', '하는', '되는', '하던', '되던', '함', '됨',
  // 조사
  '에게서', '으로부터', '로부터', '까지는', '까지도', '까지', '부터', '보다', '마저', '조차', '뿐',
  '이라서', '라서',
  '에게', '한테', '에서', '에는', '에도', '에', '의',
  '와', '과', '랑', '하고',
  '은', '는', '이', '가', '을', '를', '도', '만', '나', '이나',
  '이다', '다',
];

const SUFFIX_SORTED = [...new Set(SUFFIXES)].sort((a, b) => b.length - a.length);

function stemKorean(token: string): string {
  let t = token;
  // 한 토큰에서 짧은 조사·어미를 반복적으로 벗긴다 (최대 3회)
  for (let i = 0; i < 3; i++) {
    if (!KOREAN_BLOCK.test(t)) break;
    let stripped = false;
    for (const suf of SUFFIX_SORTED) {
      if (t.length > suf.length && t.endsWith(suf)) {
        t = t.slice(0, -suf.length);
        stripped = true;
        break;
      }
    }
    if (!stripped) break;
  }
  // 어간 길이가 1자라면 원본을 보존 (오버 스테밍 방지)
  return t.length >= 2 ? t : token;
}

function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[.,!?;:'"()[\]{}<>·…\-—~`*_/\\]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 0);
}

function bigrams(s: string): Set<string> {
  const cleaned = s.replace(/\s+/g, '');
  const out = new Set<string>();
  for (let i = 0; i < cleaned.length - 1; i++) out.add(cleaned.slice(i, i + 2));
  return out;
}

function diceCoefficient(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return (2 * inter) / (a.size + b.size);
}

export function computeSimilarity(userAnswer: string, modelAnswer: string): number {
  if (!modelAnswer.trim() || !userAnswer.trim()) return 0;

  const modelStems = new Set(tokenize(modelAnswer).map(stemKorean));
  const userStems = new Set(tokenize(userAnswer).map(stemKorean));
  if (modelStems.size === 0) return 0;

  // recall: 모범답안 어간 중 사용자 답안이 커버한 비율
  let matched = 0;
  for (const s of modelStems) {
    if (userStems.has(s)) {
      matched++;
      continue;
    }
    // 어간 부분일치도 인정 (예: "근로자" ⊃ "근로")
    for (const u of userStems) {
      if (u.length >= 2 && (s.includes(u) || u.includes(s))) {
        matched += 0.7;
        break;
      }
    }
  }
  const recall = matched / modelStems.size;

  // 글자 bigram 보강 — 짧은 답이거나 토큰화가 거친 경우 보완
  const bigramScore = diceCoefficient(bigrams(modelAnswer), bigrams(userAnswer));

  // 가중 평균: 어간 매칭이 주, bigram이 보조
  const score = recall * 0.7 + bigramScore * 0.3;
  return Math.max(0, Math.min(100, Math.round(score * 100)));
}
