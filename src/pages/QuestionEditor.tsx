import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useExamSets } from '../hooks/useExamSets';
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

  if (!set) {
    return null;
  }

  const handleSave = () => {
    if (!content.trim()) {
      showToast('문제 내용을 입력하세요.', 'error');
      return;
    }
    if (type === 'blank' && extractAnswers(content).length === 0) {
      showToast('단답형은 {{키워드}} 형식으로 빈칸을 지정해야 합니다.', 'error');
      return;
    }

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
    if (!content.trim()) {
      showToast('문제 내용을 입력하세요.', 'error');
      return;
    }
    if (type === 'blank' && extractAnswers(content).length === 0) {
      showToast('단답형은 {{키워드}} 형식으로 빈칸을 지정해야 합니다.', 'error');
      return;
    }
    addQuestion(setId!, { type, content: content.trim(), answer: answer.trim() || undefined, tags });
    showToast('추가 완료! 다음 문제를 입력하세요.');
    setContent('');
    setAnswer('');
  };

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
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {isEditing ? '문제 편집' : '문제 추가'}
          </h1>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-5">
          {/* Type tabs */}
          <div className="flex border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            {(['blank', 'essay'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${
                  type === t
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {t === 'blank' ? '단답형 (빈칸 채우기)' : '서술형'}
              </button>
            ))}
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              문제 내용 <span className="text-red-500">*</span>
              {type === 'blank' && (
                <span className="text-xs text-gray-400 dark:text-gray-500 ml-1 font-normal">
                  (키워드를 드래그하면 빈칸 자동 변환)
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
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
              />
            )}
          </div>

          {/* Answer (essay only) */}
          {type === 'essay' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                모범 답안
              </label>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                rows={4}
                placeholder="모범 답안을 입력하세요. (선택사항)"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
              />
            </div>
          )}

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              태그
            </label>
            <TagInput tags={tags} onChange={setTags} />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => navigate(`/set/${setId}`)}>
              취소
            </Button>
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
