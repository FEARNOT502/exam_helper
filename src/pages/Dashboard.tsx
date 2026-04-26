import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useExamSetsContext as useExamSets } from '../context/ExamSetsContext';
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
    const tags = newTags.split(',').map((t) => t.trim()).filter(Boolean);
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

  const totalSets = sets.length;

  return (
    <div className="eh-shell">
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '44px 28px 64px' }}>
        {/* Header */}
        <header style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20, marginBottom: 32, flexWrap: 'wrap' }}>
          <div>
            <p className="eh-eyebrow" style={{ marginBottom: 10 }}>EXAM HELPER · v2</p>
            <h1 style={{
              fontSize: 34, fontWeight: 600, letterSpacing: '-.025em',
              color: 'var(--ink)', margin: 0, lineHeight: 1.15,
            }}>
              족보
            </h1>
            <p className="eh-muted" style={{ fontSize: 14, marginTop: 8, maxWidth: 480, lineHeight: 1.55 }}>
              시험 족보를 반복 학습합니다.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 10V2M5 5l3-3 3 3M3 10v3h10v-3"/></svg>
              가져오기
            </Button>
            <input ref={fileInputRef} type="file" accept=".json" className="hidden" style={{ display: 'none' }} onChange={handleImport} />
            <Button size="sm" onClick={() => setShowNewModal(true)}>
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M8 3v10M3 8h10"/></svg>
              새 족보
            </Button>
          </div>
        </header>

        {/* Stats */}
        {totalSets > 0 && (
          <div style={{ marginBottom: 24 }}>
            <StatsOverview sets={sets} />
          </div>
        )}

        {/* Section header */}
        {totalSets > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <h2 style={{ fontSize: 13, fontWeight: 600, letterSpacing: '-.005em', color: 'var(--ink)', margin: 0 }}>
                나의 족보
              </h2>
              <span className="eh-mono eh-muted-2" style={{ fontSize: 12 }}>
                {filtered.length}{search ? ` / ${totalSets}` : ''}
              </span>
            </div>
            <div style={{ position: 'relative', width: 260, maxWidth: '50%' }}>
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"
                style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-4)', pointerEvents: 'none' }}>
                <circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5L13 13" strokeLinecap="round"/>
              </svg>
              <input
                type="search"
                placeholder="제목, 태그 검색"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="eh-input"
                style={{ paddingLeft: 32, height: 34, fontSize: 13 }}
              />
            </div>
          </div>
        )}

        {/* Content */}
        {totalSets === 0 ? (
          <EmptyState
            title="아직 족보가 없습니다"
            description="새 족보를 만들거나 JSON 파일을 가져와서 학습을 시작하세요."
            actionLabel="새 족보 만들기"
            onAction={() => setShowNewModal(true)}
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="검색 결과 없음"
            description={`"${search}"에 해당하는 족보를 찾을 수 없습니다.`}
          />
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 12,
          }}>
            {filtered.map((set) => (
              <SetCard key={set.id} set={set} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>

      <Modal open={showNewModal} onClose={() => setShowNewModal(false)} title="새 족보 만들기">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="eh-field-label">
              제목 <span style={{ color: 'var(--bad)' }}>*</span>
            </label>
            <input
              autoFocus
              type="text"
              placeholder="예: 경영학원론"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              className="eh-input"
            />
          </div>
          <div>
            <label className="eh-field-label">부제목</label>
            <input
              type="text"
              placeholder="예: 2024-1학기 중간고사"
              value={newSubtitle}
              onChange={(e) => setNewSubtitle(e.target.value)}
              className="eh-input"
            />
          </div>
          <div>
            <label className="eh-field-label">태그 (쉼표로 구분)</label>
            <input
              type="text"
              placeholder="예: 3학년, 전공필수"
              value={newTags}
              onChange={(e) => setNewTags(e.target.value)}
              className="eh-input"
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: 4 }}>
            <Button variant="secondary" onClick={() => setShowNewModal(false)}>취소</Button>
            <Button onClick={handleCreate} disabled={!newTitle.trim()}>만들기</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
