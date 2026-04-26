import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useExamSetsContext as useExamSets } from '../context/ExamSetsContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import { TagInput } from '../components/editor/TagInput';
import { BlankSelector } from '../components/editor/BlankSelector';
import { extractAnswers } from '../utils/blank-parser';

export function QuestionEditor() {
  const { id: setId, qid } = useParams<{ id: string; qid?: string }>();
  const navigate = useNavigate();
  const { getSet, addQuestion, updateQuestion } = useExamSets();
  const { showToast } = useToast();

  const set = getSet(setId!);
  const existingQuestion = qid ? set?.questions.find((q) => q.id === qid) : null;
  const isEditing = !!existingQuestion;

  const [type, setType] = useState<'blank' | 'essay'>(existingQuestion?.type ?? 'blank');
  const [content, setContent] = useState(existingQuestion?.content ?? '');
  const [answer, setAnswer] = useState(existingQuestion?.answer ?? '');
  const [tags, setTags] = useState<string[]>(existingQuestion?.tags ?? []);

  useEffect(() => {
    if (existingQuestion) {
      setType(existingQuestion.type);
      setContent(existingQuestion.content);
      setAnswer(existingQuestion.answer ?? '');
      setTags(existingQuestion.tags);
    }
  }, [existingQuestion]);

  if (!set) return null;

  const validate = () => {
    if (!content.trim()) {
      showToast('문제 내용을 입력하세요.', 'error');
      return false;
    }
    if (type === 'blank' && extractAnswers(content).length === 0) {
      showToast('단답형은 {{키워드}} 형식으로 빈칸을 지정해야 합니다.', 'error');
      return false;
    }
    return true;
  };

  const handleSave = () => {
    if (!validate()) return;
    if (isEditing && qid) {
      updateQuestion(setId!, qid, { type, content: content.trim(), answer: answer.trim() || undefined, tags });
      showToast('수정되었습니다.');
    } else {
      addQuestion(setId!, { type, content: content.trim(), answer: answer.trim() || undefined, tags });
      showToast('문제가 추가되었습니다.');
    }
    navigate(`/set/${setId}`);
  };

  const handleSaveAndNext = () => {
    if (!validate()) return;
    addQuestion(setId!, { type, content: content.trim(), answer: answer.trim() || undefined, tags });
    showToast('추가 완료! 다음 문제를 입력하세요.');
    setContent('');
    setAnswer('');
  };

  return (
    <div className="eh-shell">
      <div className="page-container" style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px 64px' }}>
        <button
          onClick={() => navigate(`/set/${setId}`)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'none', border: 'none', color: 'var(--ink-3)',
            fontSize: 12.5, cursor: 'pointer', padding: 0, marginBottom: 16,
            fontFamily: 'inherit',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3L5 8l5 5"/></svg>
          {set.title}
        </button>

        <p className="eh-eyebrow" style={{ marginBottom: 8 }}>
          {isEditing ? 'EDIT QUESTION' : 'NEW QUESTION'}
        </p>
        <h1 style={{
          fontSize: 26, fontWeight: 600, letterSpacing: '-.025em',
          color: 'var(--ink)', margin: 0, marginBottom: 24, lineHeight: 1.2,
        }}>
          {isEditing ? '문제 편집' : '문제 추가'}
        </h1>

        <div className="eh-card" style={{ padding: '24px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Type segmented control */}
          <div>
            <label className="eh-field-label">유형</label>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr',
              background: 'var(--surface-2)',
              border: '1px solid var(--line)',
              borderRadius: 10,
              padding: 3,
              gap: 3,
            }}>
              {(['blank', 'essay'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  style={{
                    padding: '8px 12px',
                    fontSize: 13,
                    fontWeight: 500,
                    borderRadius: 8,
                    border: 'none',
                    cursor: 'pointer',
                    background: type === t ? 'var(--surface)' : 'transparent',
                    color: type === t ? 'var(--ink)' : 'var(--ink-3)',
                    boxShadow: type === t ? 'var(--shadow-1)' : 'none',
                    transition: 'all .15s',
                    fontFamily: 'inherit',
                  }}
                >
                  {t === 'blank' ? '단답형 (빈칸)' : '서술형'}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="eh-field-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span>문제 내용 <span style={{ color: 'var(--bad)' }}>*</span></span>
              {type === 'blank' && (
                <span style={{ fontSize: 10.5, color: 'var(--ink-4)', textTransform: 'none', letterSpacing: 0, fontFamily: 'var(--font-sans)', fontWeight: 400 }}>
                  키워드를 드래그하면 <code style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--accent-ink)' }}>{'{{빈칸}}'}</code>으로 변환됩니다
                </span>
              )}
            </label>
            {type === 'blank' ? (
              <BlankSelector value={content} onChange={setContent} />
            ) : (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                placeholder="문제 내용을 입력하세요."
                className="eh-textarea"
              />
            )}
          </div>

          {/* Answer (essay only) */}
          {type === 'essay' && (
            <div>
              <label className="eh-field-label">모범 답안</label>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                rows={4}
                placeholder="모범 답안을 입력하세요. (선택)"
                className="eh-textarea"
              />
            </div>
          )}

          {/* Tags */}
          <div>
            <label className="eh-field-label">태그</label>
            <TagInput tags={tags} onChange={setTags} />
          </div>

          <hr className="eh-divider" />

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button variant="ghost" onClick={() => navigate(`/set/${setId}`)}>취소</Button>
            {!isEditing && (
              <Button variant="secondary" onClick={handleSaveAndNext}>
                추가하고 계속
              </Button>
            )}
            <Button onClick={handleSave}>
              {isEditing ? '저장' : '추가'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
