import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useExamSets } from '../hooks/useExamSets';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { Modal } from '../components/common/Modal';
import { QuestionList } from '../components/editor/QuestionList';
import { TagInput } from '../components/editor/TagInput';
import { exportExamSet } from '../utils/export-import';
import type { StudyFilter } from '../types';

export function SetDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getSet, updateSet, deleteQuestion, reorderQuestions } = useExamSets();
  const { showToast } = useToast();

  const set = getSet(id!);

  const [editingTitle, setEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const [subtitleInput, setSubtitleInput] = useState('');
  const [tagsInput, setTagsInput] = useState<string[]>([]);
  const [showStudyModal, setShowStudyModal] = useState(false);
  const [studyFilter, setStudyFilter] = useState<StudyFilter>('all');
  const [showExportModal, setShowExportModal] = useState(false);
  const [includeHistory, setIncludeHistory] = useState(true);

  if (!set) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <EmptyState
          icon="❌"
          title="족보를 찾을 수 없습니다"
          actionLabel="홈으로"
          onAction={() => navigate('/')}
        />
      </div>
    );
  }

  const startEdit = () => {
    setTitleInput(set.title);
    setSubtitleInput(set.subtitle ?? '');
    setTagsInput(set.tags);
    setEditingTitle(true);
  };

  const saveEdit = () => {
    if (!titleInput.trim()) return;
    updateSet(set.id, {
      title: titleInput.trim(),
      subtitle: subtitleInput.trim() || undefined,
      tags: tagsInput,
    });
    showToast('저장되었습니다.');
    setEditingTitle(false);
  };

  const handleDeleteQuestion = (qid: string) => {
    if (!window.confirm('문제를 삭제하시겠습니까?')) return;
    deleteQuestion(set.id, qid);
    showToast('삭제되었습니다.', 'info');
  };

  const handleStartStudy = () => {
    navigate(`/set/${set.id}/study?filter=${studyFilter}`);
    setShowStudyModal(false);
  };

  const handleExport = () => {
    exportExamSet(set, includeHistory);
    showToast('내보내기 완료!');
    setShowExportModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
          >
            ←
          </button>
          <div className="flex-1 min-w-0">
            {editingTitle ? (
              <div className="space-y-2">
                <input
                  autoFocus
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  className="w-full px-3 py-2 text-xl font-bold rounded-lg border border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="부제목 (선택)"
                  value={subtitleInput}
                  onChange={(e) => setSubtitleInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <TagInput tags={tagsInput} onChange={setTagsInput} />
                <div className="flex gap-2">
                  <Button size="sm" onClick={saveEdit}>
                    저장
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => setEditingTitle(false)}>
                    취소
                  </Button>
                </div>
              </div>
            ) : (
              <div
                className="cursor-pointer group"
                onClick={startEdit}
                title="클릭해서 편집"
              >
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {set.title}
                </h1>
                {set.subtitle && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">{set.subtitle}</p>
                )}
              </div>
            )}
          </div>
          <div className="flex gap-2 shrink-0">
            <Button variant="secondary" size="sm" onClick={() => setShowExportModal(true)}>
              내보내기
            </Button>
            <Button size="sm" onClick={() => setShowStudyModal(true)} disabled={set.questions.length === 0}>
              학습 시작
            </Button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mb-6">
          <Button variant="secondary" size="sm" onClick={() => navigate(`/set/${set.id}/add`)}>
            + 문제 추가
          </Button>
          {set.questions.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/set/${set.id}/wrong`)}
            >
              오답 노트
            </Button>
          )}
        </div>

        {/* Question List */}
        {set.questions.length === 0 ? (
          <EmptyState
            icon="📝"
            title="문제가 없습니다"
            description="문제를 추가하여 학습을 시작하세요."
            actionLabel="문제 추가"
            onAction={() => navigate(`/set/${set.id}/add`)}
          />
        ) : (
          <QuestionList
            setId={set.id}
            questions={set.questions}
            onReorder={(q) => reorderQuestions(set.id, q)}
            onDelete={handleDeleteQuestion}
          />
        )}
      </div>

      {/* Study Modal */}
      <Modal open={showStudyModal} onClose={() => setShowStudyModal(false)} title="학습 시작">
        <div className="space-y-3">
          {(
            [
              { value: 'all', label: '전체 문제', desc: `${set.questions.length}문제` },
              {
                value: 'unlearned',
                label: '미학습 문제',
                desc: `${set.questions.filter((q) => q.level === 0).length}문제`,
              },
              {
                value: 'wrong',
                label: '오답 문제',
                desc: `${set.questions.filter((q) => q.history.some((h) => !h.correct)).length}문제`,
              },
              { value: 'shuffle', label: '전체 셔플', desc: `${set.questions.length}문제 (랜덤 순서)` },
            ] as const
          ).map((opt) => (
            <label
              key={opt.value}
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                studyFilter === opt.value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              <input
                type="radio"
                name="studyFilter"
                value={opt.value}
                checked={studyFilter === opt.value}
                onChange={() => setStudyFilter(opt.value)}
                className="accent-blue-600"
              />
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {opt.label}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{opt.desc}</div>
              </div>
            </label>
          ))}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setShowStudyModal(false)}>
              취소
            </Button>
            <Button onClick={handleStartStudy}>시작</Button>
          </div>
        </div>
      </Modal>

      {/* Export Modal */}
      <Modal open={showExportModal} onClose={() => setShowExportModal(false)} title="내보내기">
        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={includeHistory}
              onChange={(e) => setIncludeHistory(e.target.checked)}
              className="accent-blue-600 w-4 h-4"
            />
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                학습 이력 포함
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                암기 단계 및 풀이 기록을 함께 내보냅니다
              </div>
            </div>
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setShowExportModal(false)}>
              취소
            </Button>
            <Button onClick={handleExport}>다운로드</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
