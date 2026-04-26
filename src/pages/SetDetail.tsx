import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useExamSetsContext as useExamSets } from '../context/ExamSetsContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { Modal } from '../components/common/Modal';
import { QuestionList } from '../components/editor/QuestionList';
import { TagInput } from '../components/editor/TagInput';
import { exportExamSet } from '../utils/export-import';
import { isDueForReview } from '../utils/spaced-repetition';
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
      <div className="eh-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <EmptyState
          title="족보를 찾을 수 없습니다"
          actionLabel="홈으로"
          onAction={() => navigate('/')}
        />
      </div>
    );
  }

  const total = set.questions.length;
  const memorized = set.questions.filter((q) => q.level === 3).length;
  const unlearned = set.questions.filter((q) => q.level === 0).length;
  const dueCount = set.questions.filter(isDueForReview).length;
  const wrongCount = set.questions.filter((q) => q.history.some((h) => !h.correct)).length;

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
    <div className="eh-shell">
      <div style={{ maxWidth: 880, margin: '0 auto', padding: '32px 28px 64px' }}>
        {/* Back link */}
        <button
          onClick={() => navigate('/')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'none', border: 'none', color: 'var(--ink-3)',
            fontSize: 12.5, cursor: 'pointer', padding: 0, marginBottom: 20,
            fontFamily: 'inherit',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--ink)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--ink-3)')}
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3L5 8l5 5"/></svg>
          족보 목록
        </button>

        {/* Title header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, marginBottom: 28, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 280 }}>
            {editingTitle ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <input
                  autoFocus
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  className="eh-input"
                  style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-.02em', height: 44 }}
                />
                <input
                  type="text"
                  placeholder="부제목 (선택)"
                  value={subtitleInput}
                  onChange={(e) => setSubtitleInput(e.target.value)}
                  className="eh-input"
                />
                <TagInput tags={tagsInput} onChange={setTagsInput} />
                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  <Button size="sm" onClick={saveEdit}>저장</Button>
                  <Button size="sm" variant="secondary" onClick={() => setEditingTitle(false)}>취소</Button>
                </div>
              </div>
            ) : (
              <div onClick={startEdit} style={{ cursor: 'pointer' }} title="클릭해서 편집">
                <p className="eh-eyebrow" style={{ marginBottom: 8 }}>SET</p>
                <h1 style={{
                  fontSize: 28, fontWeight: 600, letterSpacing: '-.025em',
                  color: 'var(--ink)', margin: 0, lineHeight: 1.2,
                }}>
                  {set.title}
                </h1>
                {set.subtitle && (
                  <p className="eh-muted" style={{ fontSize: 14, margin: 0, marginTop: 6 }}>
                    {set.subtitle}
                  </p>
                )}
                {set.tags.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 12 }}>
                    {set.tags.map((t) => <Badge key={t}>{t}</Badge>)}
                  </div>
                )}
              </div>
            )}
          </div>
          {!editingTitle && (
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <Button variant="secondary" size="sm" onClick={() => setShowExportModal(true)}>
                내보내기
              </Button>
              <Button variant="secondary" size="lg" onClick={() => navigate(`/set/${set.id}/practice`)} disabled={total === 0}>
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 2.5l2.5 2.5L5 13.5H2.5V11z"/></svg>
                연습하기
              </Button>
              <Button size="lg" onClick={() => setShowStudyModal(true)} disabled={total === 0}>
                학습 시작
                <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M4 3l8 5-8 5z"/></svg>
              </Button>
            </div>
          )}
        </div>

        {/* Stats row */}
        {total > 0 && (
          <div
            className="eh-card-flat"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              marginBottom: 24,
            }}
          >
            <StatCell label="총 문제" value={total} />
            <StatCell label="미학습" value={unlearned} tone={unlearned > 0 ? 'warn' : 'neutral'} divider />
            <StatCell label="암기 완료" value={memorized} tone="ok" divider />
            <StatCell label="오늘 복습" value={dueCount} tone={dueCount > 0 ? 'warn' : 'neutral'} divider />
          </div>
        )}

        {/* Sub-actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <h2 style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', margin: 0 }}>
              문제 목록
            </h2>
            <span className="eh-mono eh-muted-2" style={{ fontSize: 12 }}>{total}</span>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {wrongCount > 0 && (
              <Button variant="ghost" size="sm" onClick={() => navigate(`/set/${set.id}/wrong`)}>
                오답 노트 <span className="eh-mono eh-muted-2" style={{ fontSize: 11, marginLeft: 4 }}>{wrongCount}</span>
              </Button>
            )}
            <Button variant="secondary" size="sm" onClick={() => navigate(`/set/${set.id}/add`)}>
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M8 3v10M3 8h10"/></svg>
              문제 추가
            </Button>
          </div>
        </div>

        {/* Question List */}
        {total === 0 ? (
          <EmptyState
            title="문제가 없습니다"
            description="문제를 추가하여 학습을 시작하세요. 단답형·서술형 둘 다 가능합니다."
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {([
            { value: 'all', label: '전체 문제', desc: `${total}문제를 순서대로` },
            { value: 'unlearned', label: '미학습 문제만', desc: `${unlearned}문제` },
            { value: 'wrong', label: '오답 문제만', desc: `${wrongCount}문제` },
            { value: 'shuffle', label: '전체 셔플', desc: `${total}문제, 랜덤 순서` },
          ] as const).map((opt) => {
            const active = studyFilter === opt.value;
            return (
              <label
                key={opt.value}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '12px 14px',
                  borderRadius: 12,
                  border: `1px solid ${active ? 'var(--accent)' : 'var(--line)'}`,
                  background: active ? 'var(--accent-soft)' : 'var(--surface)',
                  cursor: 'pointer',
                  transition: 'all .12s',
                }}
              >
                <input
                  type="radio"
                  name="studyFilter"
                  value={opt.value}
                  checked={active}
                  onChange={() => setStudyFilter(opt.value)}
                  style={{ accentColor: 'var(--accent)' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 500, color: active ? 'var(--accent-ink)' : 'var(--ink)' }}>
                    {opt.label}
                  </div>
                  <div style={{ fontSize: 12, color: active ? 'var(--accent-ink)' : 'var(--ink-3)', opacity: active ? .8 : 1, marginTop: 2, fontFamily: 'var(--font-mono)' }}>
                    {opt.desc}
                  </div>
                </div>
              </label>
            );
          })}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: 8 }}>
            <Button variant="secondary" onClick={() => setShowStudyModal(false)}>취소</Button>
            <Button onClick={handleStartStudy}>시작</Button>
          </div>
        </div>
      </Modal>

      {/* Export Modal */}
      <Modal open={showExportModal} onClose={() => setShowExportModal(false)} title="내보내기">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', padding: 12, background: 'var(--surface-2)', borderRadius: 10 }}>
            <input
              type="checkbox"
              checked={includeHistory}
              onChange={(e) => setIncludeHistory(e.target.checked)}
              style={{ accentColor: 'var(--accent)', width: 16, height: 16 }}
            />
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--ink)' }}>
                학습 이력 포함
              </div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>
                암기 단계 및 풀이 기록을 함께 내보냅니다
              </div>
            </div>
          </label>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button variant="secondary" onClick={() => setShowExportModal(false)}>취소</Button>
            <Button onClick={handleExport}>JSON 다운로드</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function StatCell({
  label,
  value,
  tone = 'neutral',
  divider = false,
}: {
  label: string;
  value: number;
  tone?: 'neutral' | 'ok' | 'warn';
  divider?: boolean;
}) {
  const color = tone === 'ok' ? 'var(--ok)' : tone === 'warn' ? 'var(--warn)' : 'var(--ink)';
  return (
    <div style={{
      padding: '18px 20px',
      borderLeft: divider ? '1px solid var(--line)' : 'none',
    }}>
      <p className="eh-eyebrow" style={{ margin: 0, marginBottom: 10 }}>{label}</p>
      <div style={{
        fontSize: 26, fontWeight: 400, letterSpacing: '-.03em',
        color, lineHeight: 1,
        fontVariantNumeric: 'tabular-nums',
        fontFamily: 'var(--font-mono)',
      }}>
        {value}
      </div>
    </div>
  );
}
