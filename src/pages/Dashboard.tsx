import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useExamSets } from '../hooks/useExamSets';
import { useToast } from '../context/ToastContext';
import { SetCard } from '../components/dashboard/SetCard';
import { StatsOverview } from '../components/dashboard/StatsOverview';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { importExamSet } from '../utils/export-import';

export function Dashboard() {
  const navigate = useNavigate();
  const { sets, addSet, deleteSet, importSet } = useExamSets();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newTags, setNewTags] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = sets.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.title.toLowerCase().includes(q) ||
      (s.subtitle ?? '').toLowerCase().includes(q) ||
      s.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  const handleCreate = () => {
    if (!newTitle.trim()) return;
    const tags = newTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    const created = addSet({ title: newTitle.trim(), subtitle: newSubtitle.trim() || undefined, tags });
    showToast('족보 세트가 만들어졌습니다.');
    setShowNewModal(false);
    setNewTitle('');
    setNewSubtitle('');
    setNewTags('');
    navigate(`/set/${created.id}`);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    deleteSet(id);
    showToast('삭제되었습니다.', 'info');
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const imported = await importExamSet(file);
      imported.id = uuidv4();
      importSet(imported);
      showToast(`"${imported.title}" 가져오기 완료!`);
    } catch (err) {
      showToast((err as Error).message, 'error');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">시험 족보 암기장</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">효과적인 반복 학습으로 완벽 암기</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              가져오기
            </Button>
            <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
            <Button onClick={() => setShowNewModal(true)}>+ 새 족보</Button>
          </div>
        </div>

        {sets.length > 0 && (
          <div className="mb-6">
            <StatsOverview sets={sets} />
          </div>
        )}

        <div className="mb-5">
          <input
            type="search"
            placeholder="족보 검색 (제목, 태그)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {sets.length === 0 ? (
          <EmptyState
            icon="📚"
            title="족보가 없습니다"
            description="새 족보를 만들거나 JSON 파일을 가져오세요."
            actionLabel="새 족보 만들기"
            onAction={() => setShowNewModal(true)}
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="검색 결과가 없습니다"
            description={`"${search}"에 해당하는 족보를 찾을 수 없습니다.`}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((set) => (
              <SetCard key={set.id} set={set} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>

      <Modal open={showNewModal} onClose={() => setShowNewModal(false)} title="새 족보 만들기">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              제목 <span className="text-red-500">*</span>
            </label>
            <input
              autoFocus
              type="text"
              placeholder="예: 경영학원론"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              부제목
            </label>
            <input
              type="text"
              placeholder="예: 2024-1학기 중간고사"
              value={newSubtitle}
              onChange={(e) => setNewSubtitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              태그 (쉼표로 구분)
            </label>
            <input
              type="text"
              placeholder="예: 3학년, 전공필수"
              value={newTags}
              onChange={(e) => setNewTags(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setShowNewModal(false)}>
              취소
            </Button>
            <Button onClick={handleCreate} disabled={!newTitle.trim()}>
              만들기
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
